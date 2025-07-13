# regalcare - Waste Management System

A comprehensive waste management platform for **regalcare** that handles trash bin valet services, customer management, and scheduling.

## Features

### Customer Portal (`/customer`)
- Customer registration and login by phone number
- Service plan selection (Basic, Premium, Ultimate)
- Plan benefits and pricing comparison
- Yearly/monthly billing options
- Member dashboard with service history

### Business Dashboard (`/`)
- Customer management with full CRUD operations
- Service scheduling and route planning
- Revenue tracking and analytics
- Message center for customer communication
- Bin cleaning appointment management

## Service Plans

- **Basic Plan** ($59.99/month) - Up to 2 bins, weekly bin valet
- **Premium Plan** ($99.99/month) - Up to 3 bins, weekly bin valet + quarterly bin cleaning
- **Ultimate Plan** ($199.99/month) - 4+ bins, weekly bin valet + quarterly bin cleaning + 50% pressure washing discount

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM (currently using in-memory storage)
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/regalcare-app.git

# Navigate to project directory
cd regalcare-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Routes
- `/` - Business Dashboard
- `/customer` - Customer Portal
- `/customer/dashboard/:id` - Member Dashboard

## Key Features

### Brand Styling
- **regalcare** brand name appears in soft baby blue (#87CEEB) throughout the app
- Consistent "bin valet" terminology instead of generic "pickup"
- Modern glassmorphism design with gradient backgrounds

### Service Management
- Weekly bin valet service scheduling
- Quarterly bin cleaning appointments (Mondays/Thursdays 8am-4pm)
- Route optimization and progress tracking
- Customer communication system

### Payment Integration
- Ready for Stripe integration
- Monthly and yearly billing options
- Plan upgrade/downgrade capabilities

## Project Structure

```
regalcare-app/
├── client/src/          # React frontend
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities and API client
├── server/             # Express backend
├── shared/             # Shared types and schemas
└── configuration files
```

## Development Notes

- Uses in-memory storage for development (easily replaceable with PostgreSQL)
- All services begin August 1st, 2025
- Bin cleaning restricted to Mondays/Thursdays only
- Customer portal includes phone-based authentication
- Business dashboard includes comprehensive analytics

## License

Private project for regalcare waste management services.