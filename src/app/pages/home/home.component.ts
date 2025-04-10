import { Component, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChartConfiguration, ChartOptions, Chart } from 'chart.js';
import { Expense } from '../expenses/expenses.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnChanges {
  totalReceived = 0;
  totalSpent = 0;
  totalSaved = 0;

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

  // 👇 Updated pie chart to doughnut chart
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

  @ViewChild('pieChart') pieChart: any;
  @ViewChild('barChart') barChart: any;
  @ViewChild('lineChart') lineChart: any;

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pieChartData']) {
      this.updateCharts();
    }
  }

  loadData() {
    this.firestore.collection<Expense>('expenses').valueChanges().subscribe((data: Expense[]) => {
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
  }

  updateCharts() {
    if (this.pieChart && !this.pieChart.chart) {
      this.pieChart.chart = new Chart(this.pieChart.nativeElement, {
        type: 'doughnut', // 👈 Changed from 'pie'
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

  // 👇 Updated type from 'pie' to 'doughnut'
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
        font: { weight: 'bold' as const, size: 14 }
      }
    },
    cutout: '60%' // 🍩 thickness of donut hole
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
