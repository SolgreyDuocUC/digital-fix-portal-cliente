import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import { CommercialProvider } from "./contexts/CommercialContext";
import { CatalogProvider } from "./contexts/CatalogContext";
import { StaffHeader } from "./components/Layout/StaffHeader";
import { Header } from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import { HomePage } from "./components/Pages/1-Home/HomePage";
import { ServicesPage } from "./components/Pages/2-Catalog/ServicesPage";
import { ProductsPage } from "./components/Pages/2-Catalog/ProductsPage";
import { CatalogTabs } from "./components/Pages/2-Catalog/CatalogTabs";
import { MyOrdersPage } from "./components/Pages/5-MyOrders/MyOrdersPage";
import { CartDrawer } from "./components/Pages/3-Cart/CartDrawer";
import { CheckoutModal } from "./components/Pages/4-Checkout/CheckoutModal";
import { LoginPage } from "./components/Pages/6-Login/LoginPage";
import { Registro } from "./components/Pages/7-Register/Registro";
import { ProfilePage } from "./components/Pages/8-Profile/ProfilePage";
import { MarketingView } from "./components/Pages/9-Vista-Marketing/MarketingView";
import { MarketingCampaignsView } from "./components/Pages/9-Vista-Marketing/MarketingCampaignsView";
import { VendorPortalView } from "./components/Pages/10-Vendor/VendorPortalView";
import { SalesHeadPortalView } from "./components/Pages/11-SalesHead/SalesHeadPortalView";
import { CatalogView } from "./types/catalog";

type NavTab = "catalog" | "my-orders" | "profile" | "marketing";

const PortalContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  // Sin sesión se navega la tienda como cliente; el rol interno solo se obtiene ingresando con esa cuenta.
  const currentRole = user?.role || "CLIENTE";

  const [currentTab, setCurrentTab] = useState<NavTab>("catalog");
  const [catalogView, setCatalogView] = useState<CatalogView>("home");
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [registerOpen, setRegisterOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Al cerrar sesión desde Mi cuenta se vuelve a la tienda.
  useEffect(() => {
    if (!user && currentTab === "profile") setCurrentTab("catalog");
  }, [user, currentTab]);

  const handleCheckoutSuccess = (newOrderId: string) => {
    setToastMessage(`La orden ${newOrderId} fue enviada a la central. Puedes seguir su avance aquí.`);
    setCurrentTab("my-orders");
    setTimeout(() => {
      setToastMessage(null);
    }, 7000);
  };

  /** Navega dentro del catálogo y opcionalmente filtra por categoría */
  const handleCatalogNavigate = (view: Exclude<CatalogView, "home">, category?: string) => {
    setCatalogView(view);
    if (category) setSelectedCategory(category);
  };

  /** Pestañas de categorías del encabezado. */
  const handleBrowse = (category: string) => {
    setCurrentTab("catalog");
    if (category === "Repuestos") {
      setCatalogView("products");
    } else if (category === "Todos") {
      setSelectedCategory("Todos");
      setCatalogView("home");
    } else {
      setSelectedCategory(category);
      setCatalogView("services");
    }
  };

  const handleProceedCheckout = () => {
    setCartOpen(false);
    // El pedido queda a nombre de una cuenta: sin sesión, primero se ingresa (el carrito se conserva).
    if (isAuthenticated) setCheckoutOpen(true);
    else setLoginOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Cargando portal...</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      {/* ROL: VENDEDOR / ASESOR EN TERRENO (Maipú / Asesoría) */}
      {currentRole === "VENDEDOR" && (
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1">
            <VendorPortalView />
          </main>
          <Footer />
        </div>
      )}

      {/* ROL: ASISTENTE DE OPERACIONES COMERCIALES (Marketing & Campañas) */}
      {currentRole === "ASISTENTE_MARKETING" && (
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1">
            <MarketingCampaignsView />
          </main>
          <Footer />
        </div>
      )}

      {/* ROL: JEFE DE VENTAS Y OPERACIONES (Aprobación & KPIs) */}
      {currentRole === "JEFE_VENTAS" && (
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1">
            <SalesHeadPortalView />
          </main>
          <Footer />
        </div>
      )}

      {/* ROL: CLIENTE B2C / B2B (E-commerce Desacoplado estilo Mercado Libre) */}
      {currentRole === "CLIENTE" && (
        <>
          <Header
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
              if (tab === "catalog") setCatalogView("home");
            }}
            catalogView={catalogView}
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCategory}
            onBrowse={handleBrowse}
            onOpenCart={() => setCartOpen(true)}
            onOpenLogin={() => setLoginOpen(true)}
            onOpenRegister={() => setRegisterOpen(true)}
          />

          <main className="flex-1">
            {currentTab === "catalog" && (
              <>
                <CatalogTabs active={catalogView} onChange={setCatalogView} />

                {catalogView === "home" && (
                  <HomePage
                    onNavigate={handleCatalogNavigate}
                    onOpenOrderTracking={() => setCurrentTab("my-orders")}
                  />
                )}

                {catalogView === "services" && (
                  <ServicesPage
                    searchQuery={search}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                )}

                {catalogView === "products" && (
                  <ProductsPage searchQuery={search} />
                )}
              </>
            )}

            {currentTab === "my-orders" && (
              <MyOrdersPage
                onLogin={() => setLoginOpen(true)}
                onGoToCatalog={() => handleBrowse("Todos")}
              />
            )}

            {currentTab === "profile" && <ProfilePage onOpenOrderTracking={() => setCurrentTab("my-orders")} />}

            {currentTab === "marketing" && <MarketingView />}
          </main>

          <Footer />

          {/* Drawer lateral de Carrito */}
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onProceedCheckout={handleProceedCheckout}
          />

          {/* Modal de Despacho y Confirmación de Orden */}
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={handleCheckoutSuccess}
          />
        </>
      )}

      {/* Modales globales de Autenticación */}
      <LoginPage
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />

      <Registro
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />

      {/* Notificación flotante de confirmación estilo Mercado Libre */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 bg-white border border-slate-200 border-l-4 border-l-brand-600 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 sm:max-w-md animate-slideUp"
        >
          <p className="flex-1 text-sm text-slate-700 leading-snug">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="btn-ghost shrink-0">
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <OrderProvider>
          <CartProvider>
            <CommercialProvider>
              <PortalContent />
            </CommercialProvider>
          </CartProvider>
        </OrderProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
