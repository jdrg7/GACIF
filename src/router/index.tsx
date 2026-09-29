import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PermissionRoute } from './PermissionRoute'
import { Permission } from '../utils/permissions'
import { LoginPage } from '../pages/auth/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { QuotationsListPage } from '../pages/quotations/QuotationsListPage'
import { QuotationCreatePage } from '../pages/quotations/QuotationCreatePage'
import { QuotationDetailPage } from '../pages/quotations/QuotationDetailPage'
import { QuotationComparePage } from '../pages/quotations/QuotationComparePage'
import { UsersListPage } from '../pages/admin/users/UsersListPage'
import { UserFormPage } from '../pages/admin/users/UserFormPage'
import { ConsolidatorsListPage } from '../pages/admin/consolidators/ConsolidatorsListPage'
import { ConsolidatorFormPage } from '../pages/admin/consolidators/ConsolidatorFormPage'
import { CustomsAgentsListPage } from '../pages/admin/customs-agents/CustomsAgentsListPage'
import { CustomsAgentFormPage } from '../pages/admin/customs-agents/CustomsAgentFormPage'
import { ClientsListPage } from '../pages/admin/clients/ClientsListPage'
import { ClientFormPage } from '../pages/admin/clients/ClientFormPage'
import { ProductsListPage } from '../pages/admin/products/ProductsListPage'
import { ProductFormPage } from '../pages/admin/products/ProductFormPage'
import { SuppliersListPage } from '../pages/admin/suppliers/SuppliersListPage'
import { SupplierFormPage } from '../pages/admin/suppliers/SupplierFormPage'
import { PalletsListPage } from '../pages/admin/pallets/PalletsListPage'
import { PalletFormPage } from '../pages/admin/pallets/PalletFormPage'
import { CountriesListPage } from '../pages/admin/countries/CountriesListPage'
import { CountryFormPage } from '../pages/admin/countries/CountryFormPage'
import { CurrenciesListPage } from '../pages/admin/currencies/CurrenciesListPage'
import { ExchangeRatesListPage } from '../pages/admin/exchange-rates/ExchangeRatesListPage'
import { ExchangeRateFormPage } from '../pages/admin/exchange-rates/ExchangeRateFormPage'
import { ConsolidatorTariffsPage } from '../pages/admin/tariffs/ConsolidatorTariffsPage'
import { ConsolidatorTariffFormPage } from '../pages/admin/tariffs/ConsolidatorTariffFormPage'
import { CustomsAgentTariffsPage } from '../pages/admin/tariffs/CustomsAgentTariffsPage'
import { CustomsAgentTariffFormPage } from '../pages/admin/tariffs/CustomsAgentTariffFormPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          {
            element: <PermissionRoute permission={Permission.QUOTATION_VIEW} />,
            children: [
              { path: '/quotations', element: <QuotationsListPage /> },
              { path: '/quotations/:id', element: <QuotationDetailPage /> },
            ],
          },
          {
            element: <PermissionRoute permission={[Permission.QUOTATION_CREATE, Permission.QUOTATION_CREATE_DRAFT]} />,
            children: [{ path: '/quotations/new', element: <QuotationCreatePage /> }],
          },
          {
            element: <PermissionRoute permission={Permission.QUOTATION_COMPARE} />,
            children: [{ path: '/quotations/compare', element: <QuotationComparePage /> }],
          },
          {
            element: <PermissionRoute permission={Permission.USER_MANAGE} />,
            children: [
              { path: '/admin/users', element: <UsersListPage /> },
              { path: '/admin/users/new', element: <UserFormPage /> },
              { path: '/admin/users/:id', element: <UserFormPage /> },
            ],
          },
          {
            element: <PermissionRoute permission={Permission.MASTER_DATA_VIEW} />,
            children: [
              { path: '/admin/consolidators', element: <ConsolidatorsListPage /> },
              { path: '/admin/consolidators/new', element: <ConsolidatorFormPage /> },
              { path: '/admin/consolidators/:id', element: <ConsolidatorFormPage /> },
              { path: '/admin/customs-agents', element: <CustomsAgentsListPage /> },
              { path: '/admin/customs-agents/new', element: <CustomsAgentFormPage /> },
              { path: '/admin/customs-agents/:id', element: <CustomsAgentFormPage /> },
              { path: '/admin/clients', element: <ClientsListPage /> },
              { path: '/admin/clients/new', element: <ClientFormPage /> },
              { path: '/admin/clients/:id', element: <ClientFormPage /> },
              { path: '/admin/products', element: <ProductsListPage /> },
              { path: '/admin/products/new', element: <ProductFormPage /> },
              { path: '/admin/products/:id', element: <ProductFormPage /> },
              { path: '/admin/suppliers', element: <SuppliersListPage /> },
              { path: '/admin/suppliers/new', element: <SupplierFormPage /> },
              { path: '/admin/suppliers/:id', element: <SupplierFormPage /> },
              { path: '/admin/pallets', element: <PalletsListPage /> },
              { path: '/admin/pallets/new', element: <PalletFormPage /> },
              { path: '/admin/pallets/:id', element: <PalletFormPage /> },
              { path: '/admin/countries', element: <CountriesListPage /> },
              { path: '/admin/countries/new', element: <CountryFormPage /> },
              { path: '/admin/countries/:id', element: <CountryFormPage /> },
              { path: '/admin/currencies', element: <CurrenciesListPage /> },
              { path: '/admin/exchange-rates', element: <ExchangeRatesListPage /> },
              { path: '/admin/exchange-rates/new', element: <ExchangeRateFormPage /> },
            ],
          },
          {
            element: <PermissionRoute permission={Permission.TARIFF_VIEW} />,
            children: [
              { path: '/admin/tariffs/consolidator', element: <ConsolidatorTariffsPage /> },
              { path: '/admin/tariffs/consolidator/new', element: <ConsolidatorTariffFormPage /> },
              { path: '/admin/tariffs/consolidator/:id', element: <ConsolidatorTariffFormPage /> },
              { path: '/admin/tariffs/customs-agent', element: <CustomsAgentTariffsPage /> },
              { path: '/admin/tariffs/customs-agent/new', element: <CustomsAgentTariffFormPage /> },
              { path: '/admin/tariffs/customs-agent/:id', element: <CustomsAgentTariffFormPage /> },
            ],
          },
        ],
      },
    ],
  },
])
