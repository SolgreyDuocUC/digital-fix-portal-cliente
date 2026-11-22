import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
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
import { ProfilePage } from "./components/Pages/8-Profile/ProfilePage";
import { Icon } from "./components/ui/Icon";
import { CatalogView } from "./types/catalog";

type NavTab = "catalog" | "my-orders" | "profile";

const PortalContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>("catalog");
  const [catalogView, setCatalogView] = useState<CatalogView>("home");
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCheckoutSuccess = (newOrderId: string) => {
    setToastMessage(`¡Orden ${newOrderId} creada exitosamente! La cuadrilla ha sido notificada en terreno.`);
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

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Header Corporativo estilo United Deals / Mercado Libre */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === "catalog") setCatalogView("home");
        }}
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenCart={() => setCartOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      {/* Contenido principal según pestaña seleccionada */}
      <main className="flex-1">
        {currentTab === "catalog" && (
          <>
            {/* Barra de pestañas interna: Inicio / Servicios / Productos */}
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

        {currentTab === "my-orders" && <MyOrdersPage />}

        {currentTab === "profile" && <ProfilePage />}
      </main>

      {/* Pie de página con enlaces y certificaciones */}
      <Footer />

      {/* Drawer lateral de Carrito */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Modal de Despacho y Confirmación de Orden */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Modal de Ingreso Cliente (Aislado de Entra ID) */}
      <LoginPage
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          alert("Los nuevos clientes se registran automáticamente al realizar su primer pedido de visita técnica o repuestos.");
        }}
      />

      {/* Notificación flotante de confirmación estilo Mercado Libre */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3.5 max-w-md animate-slideUp">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Icon name="check" size={18} />
          </div>
          <div className="flex-1 text-xs">
            <strong className="block text-white font-bold mb-0.5">Despacho Coordinado</strong>
            <span className="text-slate-300 leading-normal">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>
          <PortalContent />
        </CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}
