import { Component, Input, computed, inject, input } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexTooltip,
  ApexMarkers,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexAnnotations,
  ApexStates,
  ApexTheme,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  annotations?: ApexAnnotations;
  states?: ApexStates;
  theme?: ApexTheme;
  colors?: string[];
  labels?: string[];
};

type DailySummary = {
  date: string;
  income: number;
  expense: number;
};

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class Chart {
  @Input() currentChart = 1;
  rangeDays = input(14);

  private transactionService = inject(TransactionService);

  private filteredTransactions = computed(() => {
    const transactions = this.transactionService.transactions();
    const transactionDates = transactions
      .map((transaction) => this.toTransactionDate(transaction.createDate))
      .filter((date): date is Date => date !== null);
    const endDate = transactionDates.length
      ? new Date(Math.max(...transactionDates.map((date) => date.getTime())))
      : new Date();
    const startDate = this.getRangeStartDate(this.rangeDays(), endDate);

    return transactions.filter((transaction) => {
      const transactionDate = this.toTransactionDate(transaction.createDate);
      return transactionDate !== null && transactionDate >= startDate && transactionDate <= endDate;
    });
  });

  dailySummaries = computed(() => {
    const summaries = new Map<string, DailySummary>();

    for (const transaction of this.filteredTransactions()) {
      const date = this.toDateKey(transaction.createDate);
      if (!date) continue;

      const current = summaries.get(date) ?? { date, income: 0, expense: 0 };
      if (this.isIncome(transaction)) {
        current.income += this.toAmount(transaction.amount);
      } else if (this.isExpense(transaction)) {
        current.expense += this.toAmount(transaction.amount);
      }
      summaries.set(date, current);
    }

    return [...summaries.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-this.rangeDays());
  });

  categorySummaries = computed(() => {
    const summaries = new Map<string, number>();

    for (const transaction of this.filteredTransactions()) {
      if (!this.isExpense(transaction)) continue;

      const category = transaction.categoryId?.category_name || 'Uncategorized';
      summaries.set(category, (summaries.get(category) ?? 0) + this.toAmount(transaction.amount));
    }

    return [...summaries.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  });

  hasDailyData = computed(() => this.dailySummaries().some((item) => item.income > 0 || item.expense > 0));

  hasCategoryData = computed(() => this.categorySummaries().some((item) => item.value > 0));

  chartOptions = computed<Partial<ChartOptions>>(() => {
    const summaries = this.dailySummaries();

    return {
      series: [
        {
          name: 'Income',
          data: summaries.map((item) => item.income),
        },
        {
          name: 'Expense',
          data: summaries.map((item) => item.expense),
        },
      ],
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false,
        },
      },
      colors: ['#10b981', '#ef4444'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '48%',
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => this.formatShortCurrency(val),
        offsetY: -18,
        style: {
          fontSize: '11px',
          colors: ['#334155'],
        },
      },
      xaxis: {
        categories: summaries.map((item) => this.formatDateLabel(item.date)),
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => this.formatShortCurrency(val),
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
      },
      tooltip: {
        y: {
          formatter: (val: number) => this.formatCurrency(val),
        },
      },
      title: {
        text: 'Daily cash flow',
        align: 'left',
        style: {
          color: '#334155',
          fontSize: '16px',
        },
      },
    };
  });

  chartPieOptions = computed<Partial<ChartOptions>>(() => {
    const summaries = this.categorySummaries();

    return {
      series: summaries.map((item) => item.value),
      chart: {
        height: 350,
        type: 'pie',
      },
      labels: summaries.map((item) => item.label),
      colors: ['#ef4444', '#f97316', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'],
      legend: {
        position: 'bottom',
      },
      tooltip: {
        y: {
          formatter: (val: number) => this.formatCurrency(val),
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 320,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  });

  private isIncome(transaction: Transaction) {
    return transaction.categoryId?.category_type === 'income';
  }

  private isExpense(transaction: Transaction) {
    return transaction.categoryId?.category_type === 'expense';
  }

  private toDateKey(value: string | null | undefined) {
    if (!value) return '';
    return value.substring(0, 10);
  }

  private toTransactionDate(value: string | null | undefined) {
    const dateKey = this.toDateKey(value);
    const [year, month, day] = dateKey.split('-').map(Number);

    if (!year || !month || !day) return null;

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private getRangeStartDate(days: number, endDate: Date) {
    const startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - days + 1);
    return startDate;
  }

  private toAmount(value: number | null | undefined) {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
  }

  private formatDateLabel(date: string) {
    const parsed = this.toTransactionDate(date);
    if (!parsed) return date;

    return parsed.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
    });
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private formatShortCurrency(value: number) {
    if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}M`;
    if (value >= 1_000) return `${Math.round(value / 100) / 10}K`;
    return `${Math.round(value)}`;
  }
}
