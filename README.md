**Expense Tracker - Project Overview**

### Introduction
**Expense Tracker** is a modern, feature-rich web application built with **Angular** and **Firebase**, designed to help individuals effectively manage their personal finances. With a clean, intuitive interface and robust backend integration, the platform simplifies expense tracking, bill management, and financial analysis.

The application emphasizes ease of use, responsiveness across devices, and real-time data updates to provide a seamless experience for users monitoring their income, expenditures, and recurring obligations.

---

### Key Features

#### Expense Management
- Add, edit, and delete daily expenses.
- Categorize transactions by type (e.g., Food, Utilities, Entertainment, etc.).
- Track payment methods and locations.
- Real-time filtering and summary visualization.

#### Bill & Loan Tracking
- Manage **Credit Card Bills**, **Recurring Regular Bills**, and **Personal Loans**:
  - **Credit Cards**: Monitor installment progress, remaining balance, and due amounts.
  - **Regular Bills**: Track rent, EMI, subscriptions with optional monthly repetition.
  - **Personal Loans**: Distinguish between loans given and received with calculated repayment tracking.
- Automatic computation of total due, paid amount, and remaining installments.

#### Calendar View
- Visual monthly calendar highlighting upcoming due bills.
- Interactive tooltips with detailed bill data.
- Month and year selection, as well as navigation controls.

#### Monthly Summary Dashboard
- Consolidated view of total income vs. expenses vs. net savings.
- Responsive area chart for monthly financial trend analysis.
- Dynamic sync between bill entries and dashboard metrics for real-time updates.

#### Seamless Data Sync
- All data is persisted in **Firebase Firestore**, with automatic updates reflected across all relevant components.
- No manual refresh required between views (e.g., Bills → Monthly dashboard).

---

### Technical Stack
| Layer         | Technologies Used                          |
|---------------|---------------------------------------------|
| Frontend      | Angular 16, Angular Material, SCSS         |
| Backend       | Firebase Firestore (NoSQL)                 |
| Hosting       | Firebase Hosting                           |
| Charts        | Chart.js (via ng2-charts)                  |
| DevOps        | Git, GitHub, VS Code                       |

---

### Highlights
- Responsive and mobile-friendly design
- Real-time updates with Firestore listeners
- Smart logic based on bill types
- Advanced handling of recurring installments
- Visual calendar integration with smart due bill display

---

### Potential Future Enhancements
- Export monthly reports (PDF/Excel)
- Set financial goals and receive alerts
- Third-party integration (e.g., bank imports)
- Tag-based insights and advanced analytics

---

**Expense Tracker** brings clarity to personal finances by unifying everyday expenses, loans, and recurring bills in a centralized, modern platform.

