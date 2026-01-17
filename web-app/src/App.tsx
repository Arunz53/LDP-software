import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import LabReportForm from './components/LabReportForm';
import TransportForm from './components/TransportForm';
import AccountsForm from './components/AccountsForm';
import VendorForm from './components/VendorForm';
import MilkTypeMasterPage from './pages/MilkTypeMasterPage';
import VehicleMasterPage from './pages/VehicleMasterPage';
import PurchasePage from './pages/PurchasePage';
import SalesPage from './pages/SalesPage';
import AppLayout from './components/AppLayout';
import { DataProvider, useData } from './context/DataContext';

const PrivateRoute: React.FC<{ component: React.ComponentType<any>; path: string; exact?: boolean }> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, isBootstrapped, isLoading } = useData();
  
  if (!isBootstrapped) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f7fb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🔄</div>
          <div style={{ fontSize: 16, color: '#64748b' }}>Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <Route
      {...rest}
      render={(props) => (isAuthenticated ? <Component {...props} /> : <Redirect to="/" />)}
    />
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <AppLayout>
          <Switch>
            <Route path="/" exact component={LoginForm} />
            <PrivateRoute path="/dashboard" component={Dashboard} />
            <PrivateRoute path="/reports" component={Reports} />
            <PrivateRoute path="/lab-report" component={LabReportForm} />
            <PrivateRoute path="/transport" component={TransportForm} />
            <PrivateRoute path="/accounts" component={AccountsForm} />
            <PrivateRoute path="/vendors" component={VendorForm} />
            <PrivateRoute path="/milk-types" component={MilkTypeMasterPage} />
            <PrivateRoute path="/vehicles" component={VehicleMasterPage} />
            <PrivateRoute path="/purchase" component={PurchasePage} />
            <PrivateRoute path="/sales" component={SalesPage} />
          </Switch>
        </AppLayout>
      </Router>
    </DataProvider>
  );
};

export default App;