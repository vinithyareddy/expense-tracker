import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Expense } from '../expenses/expenses.component';
import { Bill } from '../../models/bill.model';
import firebase from 'firebase/compat/app';
import { AuthService } from 'src/app/services/auth.service';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnChanges, OnDestroy {
  totalReceived = 0;
  totalSpent = 0;
  totalSaved = 0;
  totalCardAmount = 0;

  @ViewChild('pieChart') pieChart: any;
  @ViewChild('barChart') barChart: any;
  @ViewChild('lineChart') lineChart: any;
  @ViewChild('cardLineChart') cardLineChart: any;

  cardBalanceChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Card Balance',
        data: [],
        borderColor: '#9c27b0',
        backgroundColor: 'rgba(156, 39, 176, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Savings',
        fill: true,
        tension: 0.4,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)'
      }
    ]
  };

  pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#26c6da']
      }
    ]
  };

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Spent',
        backgroundColor: '#ff7043',
        barPercentage: 0.4,
        categoryPercentage: 0.6
      }
    ]
  };

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadData();
    this.loadBills();

    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  handleStorageChange(event: StorageEvent) {
    if (
      event.key === 'cardBalanceHistory' ||
      event.key === 'totalCreditCardAmount' ||
      event.key === 'bills'
    ) {
      this.loadBills();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pieChartData']) {
      this.updateCharts();
    }
  }

  loadData() {
    this.authService.user$.subscribe(user => {
      if (!user) return;

      this.firestore.collection<Expense>('expenses', ref =>
        ref.where('userId', '==', user.uid)
      ).valueChanges()
        .subscribe((data: Expense[]) => {
          let received = 0;
          let spent = 0;

          const monthlyMap: { [key: string]: { received: number; spent: number } } = {};
          const categoryMap: { [category: string]: number } = {};

          data.forEach(exp => {
            const date = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
            if (isNaN(date.getTime())) return;

            const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            const isIncome = exp.category.toLowerCase() === 'income';

            if (!monthlyMap[monthKey]) {
              monthlyMap[monthKey] = { received: 0, spent: 0 };
            }

            if (isIncome) {
              received += exp.amount;
              monthlyMap[monthKey].received += exp.amount;
            } else {
              spent += exp.amount;
              monthlyMap[monthKey].spent += exp.amount;

              if (!categoryMap[exp.category]) categoryMap[exp.category] = 0;
              categoryMap[exp.category] += exp.amount;
            }
          });

          this.totalReceived = received;
          this.totalSpent = spent;
          this.totalSaved = received - spent;

          const monthLabels = Object.keys(monthlyMap);
          const savingsData = monthLabels.map(key => monthlyMap[key].received - monthlyMap[key].spent);
          const spentData = monthLabels.map(key => monthlyMap[key].spent);
          const pieLabels = Object.keys(categoryMap);
          const pieData = pieLabels.map(key => categoryMap[key]);

          this.lineChartData.labels = monthLabels;
          this.lineChartData.datasets[0].data = savingsData;

          this.barChartData.labels = monthLabels;
          this.barChartData.datasets[0].data = spentData;

          this.pieChartData.labels = pieLabels;
          this.pieChartData.datasets[0].data = pieData;

          this.updateCharts();
        });
    });
  }

  loadBills() {
    this.authService.user$.subscribe(user => {
      if (!user) return;

      this.firestore.collection('users').doc(user.uid).collection('cardBalanceHistory')
        .get().subscribe(snapshot => {
          const history: Record<string, number> = {};
          snapshot.forEach(doc => {
            history[doc.id] = doc.data()['value'];
          });

          const sortedMonths = Object.keys(history).sort((a, b) => {
            const [aMonth, aYear] = a.split(' ');
            const [bMonth, bYear] = b.split(' ');
            return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
          });

          this.cardBalanceChartData.labels = sortedMonths;

          const chartData = sortedMonths.map(m => {
            const val = history[m];
            return typeof val === 'number' ? val : Number(val) || 0;
          }) as number[];

          this.cardBalanceChartData.datasets[0].data = chartData;

          const latestMonth = sortedMonths.at(-1);
          this.totalCardAmount = latestMonth ? (history[latestMonth] || 0) : 0;

          setTimeout(() => {
            if (this.cardLineChart && !this.cardLineChart.chart) {
              this.cardLineChart.chart = new Chart(this.cardLineChart.nativeElement, {
                type: 'line',
                data: this.cardBalanceChartData,
                options: {
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    datalabels: {
                      anchor: 'end',
                      align: 'top',
                      font: { size: 13, weight: 'bold' },
                      color: '#6a11cb',
                      formatter: (value: number) => {
                        return `$${value.toLocaleString(undefined, {
                          minimumFractionDigits: value % 1 === 0 ? 0 : 1,
                          maximumFractionDigits: 2
                        })}`;
                      }
                    }
                  },
                  layout: { padding: { top: 10, bottom: 10, right: 30 } }
                },
                plugins: [ChartDataLabels]
              });
            } else if (this.cardLineChart?.chart) {
              this.cardLineChart.chart.data = this.cardBalanceChartData;
              this.cardLineChart.chart.update();
            }
          }, 100);
        });
    });
  }

  updateCharts() {
    if (this.pieChart && !this.pieChart.chart) {
      this.pieChart.chart = new Chart(this.pieChart.nativeElement, {
        type: 'doughnut',
        data: this.pieChartData,
        options: this.pieChartOptions
      });
    }
    if (this.barChart && !this.barChart.chart) {
      this.barChart.chart = new Chart(this.barChart.nativeElement, {
        type: 'bar',
        data: this.barChartData,
        options: this.barChartOptions
      });
    }
    if (this.lineChart && !this.lineChart.chart) {
      this.lineChart.chart = new Chart(this.lineChart.nativeElement, {
        type: 'line',
        data: this.lineChartData,
        options: this.lineChartOptions
      });
    }
  }

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      datalabels: {
        color: '#fff',
        formatter: (value: number, ctx) => {
          const data = ctx.chart.data.datasets[0].data as number[];
          const total = data.reduce((a, b) => a + b, 0);
          return total ? ((value / total) * 100).toFixed(0) + '%' : '';
        },
        font: { weight: 'bold', size: 14 }
      }
    },
    cutout: '60%'
  };

  pieChartPlugins = [ChartDataLabels];

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    },
    layout: { padding: { top: 10, bottom: 10 } }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      x: {
        ticks: { font: { size: 12 } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 12 } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    }
  };
}
