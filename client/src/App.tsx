import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import AddProduct from "@/pages/admin/AddProduct";
import VyaparSync from "@/pages/admin/VyaparSync";
import ProductManagement from "@/pages/admin/ProductManagement";
import ChangePin from "@/pages/ChangePin";
import DataImport from "@/pages/admin/DataImport";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/cart" component={Cart} />
      <Route path="/orders" component={Orders} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/add-product" component={AddProduct} />
      <Route path="/admin/products" component={ProductManagement} />
      <Route path="/admin/vyapar-sync" component={VyaparSync} />
      <Route path="/admin/data-import" component={DataImport} />
      <Route path="/change-pin" component={ChangePin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Router />
              <Toaster />
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
