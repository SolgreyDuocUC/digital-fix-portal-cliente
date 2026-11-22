import React, { createContext, useContext, useEffect, useState } from "react";
import {
  CommercialQuote,
  MarketingCampaign,
  CommuneCoverage,
  CommercialKpis,
  ServiceReview,
  OperationalProductCatalogItem,
} from "../types/commercial";
import { useOrders } from "./OrderContext";
import { ClientOrder, ClientOrderItem } from "../types/order";

interface CommercialContextType {
  quotes: CommercialQuote[];
  campaigns: MarketingCampaign[];
  communesCoverage: CommuneCoverage[];
  reviews: ServiceReview[];
  operationalItems: OperationalProductCatalogItem[];
  kpis: CommercialKpis;
  createQuote: (quoteData: Omit<CommercialQuote, "id" | "createdAt" | "status" | "subtotal" | "iva" | "total" | "syncStatus">, asDraft?: boolean) => CommercialQuote;
  sendQuoteEmail: (quoteId: string) => boolean;
  approveQuoteAndConvertToOrder: (quoteId: string) => ClientOrder | null;
  rejectQuote: (quoteId: string, reason: string) => boolean;
  createCampaign: (campaignData: Omit<MarketingCampaign, "id" | "createdAt" | "status">) => MarketingCampaign;
  approveCampaign: (campaignId: string, notes?: string) => boolean;
  rejectCampaign: (campaignId: string, notes: string) => boolean;
  addReview: (reviewData: Omit<ServiceReview, "id" | "date">) => ServiceReview;
  updateOperationalItemImage: (itemId: number, imageUrl: string, newDescription?: string) => boolean;
}

const QUOTES_STORAGE_KEY = "digitalfix_commercial_quotes";
const CAMPAIGNS_STORAGE_KEY = "digitalfix_commercial_campaigns";
const REVIEWS_STORAGE_KEY = "digitalfix_commercial_reviews";
const OP_ITEMS_STORAGE_KEY = "digitalfix_operational_catalog_items";

export const COMMUNES_COVERAGE: CommuneCoverage[] = [
  { commune: "Maipú", activeSquads: 4, responseTimeMin: "Menor a 1.5 horas", isCovered: true, highlightZone: true },
  { commune: "Santiago Centro", activeSquads: 5, responseTimeMin: "Menor a 2 horas", isCovered: true, highlightZone: false },
  { commune: "Providencia", activeSquads: 3, responseTimeMin: "Menor a 1.5 horas", isCovered: true, highlightZone: false },
  { commune: "Las Condes", activeSquads: 4, responseTimeMin: "Menor a 2 horas", isCovered: true, highlightZone: false },
  { commune: "Puente Alto", activeSquads: 3, responseTimeMin: "Menor a 2.5 horas", isCovered: true, highlightZone: false },
  { commune: "San Miguel", activeSquads: 2, responseTimeMin: "Menor a 2 horas", isCovered: true, highlightZone: false },
  { commune: "La Florida", activeSquads: 3, responseTimeMin: "Menor a 2 horas", isCovered: true, highlightZone: false },
  { commune: "Quilicura", activeSquads: 2, responseTimeMin: "Menor a 2.5 horas", isCovered: true, highlightZone: false },
  {
    commune: "San José de Maipo",
    activeSquads: 1,
    responseTimeMin: "3 a 5 horas",
    isCovered: true,
    highlightZone: false,
    zoneRestrictionNotes: "Zona Cordillerana: Solo servicios diurnos y sujetos a condiciones climáticas.",
  },
  {
    commune: "Til Til",
    activeSquads: 1,
    responseTimeMin: "3 a 4 horas",
    isCovered: true,
    highlightZone: false,
    zoneRestrictionNotes: "Zona Rural Norte: Requiere viático adicional de cuadrilla en terreno.",
  },
];

const INITIAL_QUOTES: CommercialQuote[] = [
  {
    id: "#COT-0000012",
    createdAt: "2026-10-13T11:20:00Z",
    expiresAt: "2026-11-28T23:59:59Z",
    sellerId: "usr-vend-201",
    sellerName: "Elizabeth Aguirre",
    clientName: "Superintendencia de Servicios Sanitarios (SISS)",
    clientRut: "60.504.000-8",
    clientEmail: "contacto@siss.gob.cl",
    clientPhone: "+56 9 8222 1100",
    clientCommune: "Santiago Centro",
    clientAddress: "Moneda 673, Piso 7",
    jobTitle: "Normalización de Tablero de Fuerza y Respaldo",
    serviceTypeTemplate: "Mantención y Balanceo de Tableros TDA",
    isPriorSiteVisitRequired: true,
    requiresSecOfficialCertification: true,
    referenceQuoteId: "#COT-0000008",
    syncStatus: "SINCRONIZADO",
    items: [
      {
        productId: 2,
        code: "SRV-TAB-02",
        name: "Mantención Preventiva de Tablero General (TDA/TG)",
        category: "Tableros & Potencia",
        quantity: 1,
        unitPrice: 64990,
        subtotal: 64990,
        isService: true,
      },
    ],
    subtotal: 64990,
    iva: 12348,
    total: 77338,
    status: "BORRADOR",
    notes: "Borrador de solicitud para licitación pública en proceso.",
  },
  {
    id: "#COT-0000011",
    createdAt: "2026-10-07T09:40:00Z",
    expiresAt: "2026-11-22T23:59:59Z",
    sellerId: "usr-vend-201",
    sellerName: "Rodrigo Valenzuela",
    clientName: "Panificadora El Canelo Maipú",
    clientRut: "77.891.203-4",
    clientEmail: "contacto@panelcanelo.cl",
    clientPhone: "+56 9 8122 3344",
    clientCommune: "Maipú",
    clientAddress: "Av. Pajaritos 4200, Local 3, Maipú",
    jobTitle: "Revisión Termográfica + Reposición de Protecciones Diferenciales",
    serviceTypeTemplate: "Atención de Emergencia y Mantenimiento",
    isPriorSiteVisitRequired: false,
    requiresSecOfficialCertification: true,
    referenceQuoteId: "#COT-0000004",
    syncStatus: "SINCRONIZADO",
    items: [
      {
        productId: 2,
        code: "SRV-TAB-02",
        name: "Mantención Preventiva de Tablero General (TDA/TG)",
        category: "Tableros & Potencia",
        quantity: 1,
        unitPrice: 64990,
        subtotal: 64990,
        isService: true,
      },
      {
        productId: 7,
        code: "REP-DIF-25",
        name: "Interruptor Diferencial Bipolar 25A 30mA Schneider",
        category: "Repuestos",
        quantity: 2,
        unitPrice: 22990,
        subtotal: 45980,
        isService: false,
      },
    ],
    subtotal: 110970,
    iva: 21084,
    total: 132054,
    status: "PENDIENTE_APROBACION",
    notes: "Cliente evaluando presupuesto con administración de finanzas.",
  },
  {
    id: "#COT-0000001",
    createdAt: "2026-10-06T15:10:00Z",
    expiresAt: "2026-11-20T23:59:59Z",
    sellerId: "usr-vend-202",
    sellerName: "Antuan Andrés Jury",
    clientName: "Condominio Los Robles de Maipú",
    clientRut: "65.412.980-1",
    clientEmail: "administracion@condominiolosrobles.cl",
    clientPhone: "+56 9 7555 1290",
    clientCommune: "Maipú",
    clientAddress: "Segunda Transversal 1840, Maipú",
    jobTitle: "Prueba y Mantenimiento de Grupo Electrógeno Comunitario",
    serviceTypeTemplate: "Grupos Electrógenos y Transferencia TTA",
    isPriorSiteVisitRequired: true,
    requiresSecOfficialCertification: true,
    syncStatus: "SINCRONIZADO",
    items: [
      {
        productId: 4,
        code: "SRV-GEN-04",
        name: "Mantención y Prueba de Grupo Electrógeno",
        category: "Generadores",
        quantity: 1,
        unitPrice: 129990,
        subtotal: 129990,
        isService: true,
      },
    ],
    subtotal: 129990,
    iva: 24698,
    total: 154688,
    status: "APROBADA_POR_CLIENTE",
    convertedOrderId: "DF-1038",
    notes: "Aprobada formalmente. Pasada a panel operativo.",
  },
];

const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: "CMP-2026-001",
    createdAt: "2026-11-15T09:00:00Z",
    createdBy: "Constanza Morales (Asistente de Operaciones Comerciales)",
    title: "Revisión de tableros + limpieza de componentes con 30% de descuento",
    description: "Inspección termográfica profunda de tableros TDA, reapriete con torquímetro y limpieza dieléctrica certificada para evitar cortocircuitos.",
    associatedItemIds: [2, 7],
    associatedItemNames: ["Mantención Preventiva Tablero TDA", "Diferencial Schneider 25A"],
    discountPercentage: 30,
    regularPrice: 99990,
    promoPrice: 69990,
    validUntil: "2026-11-28",
    referencePhotoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    status: "APROBADA",
    reviewedBy: "Carlos Henríquez (Jefe de Ventas)",
    reviewedAt: "2026-11-16T11:00:00Z",
    reviewNotes: "Excelente margen operativo y disponibilidad de cuadrillas en la RM.",
  },
  {
    id: "CMP-2026-002",
    createdAt: "2026-11-21T16:20:00Z",
    createdBy: "Constanza Morales (Asistente de Operaciones Comerciales)",
    title: "Pack Certificación TE1 SEC + Medición de Malla a Tierra PyME",
    description: "Trámite oficial ante la Superintendencia de Electricidad y Combustibles con firma de Instalador Clase A e informe telurométrico.",
    associatedItemIds: [3],
    associatedItemNames: ["Normalización Eléctrica y Tramitación TE1 (SEC)"],
    discountPercentage: 20,
    regularPrice: 220000,
    promoPrice: 175990,
    validUntil: "2026-12-15",
    referencePhotoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    status: "PENDIENTE_APROBACION",
  },
];

const INITIAL_REVIEWS: ServiceReview[] = [
  {
    id: "REV-101",
    serviceOrProductId: 2,
    targetName: "Mantención Preventiva de Tablero General (TDA/TG)",
    clientName: "Almacenes San Pedro (Maipú)",
    clientCommune: "Maipú",
    rating: 5,
    date: "2026-11-19",
    comment: "Excelente servicio del técnico Rodrigo Valenzuela. Detectó con cámara termográfica un borne sobrecalentado a 85°C que casi provoca incendio.",
    category: "FELICITACION",
    verifiedPurchase: true,
  },
  {
    id: "REV-102",
    serviceOrProductId: 3,
    targetName: "Normalización Eléctrica y Tramitación TE1 (SEC)",
    clientName: "Inmobiliaria Santa María",
    clientCommune: "Las Condes",
    rating: 4,
    date: "2026-11-14",
    comment: "El certificado TE1 salió aprobado sin observaciones por la SEC. Solo demoró 2 días más de lo estipulado por demora en la plataforma de la SEC.",
    category: "MEJORA",
    verifiedPurchase: true,
    actionTaken: "Se implementó canal prioritario de tramitación con el Colegio de Instaladores.",
  },
  {
    id: "REV-103",
    serviceOrProductId: 1,
    targetName: "Visita Técnica Eléctrica de Emergencia",
    clientName: "Restaurant Donde Carlos",
    clientCommune: "Santiago Centro",
    rating: 3,
    date: "2026-11-10",
    comment: "La cuadrilla resolvió la falla en 30 minutos, pero tardaron 2 horas y 15 minutos en llegar por taco en Alameda. Deberían tener base en Santiago Poniente.",
    category: "CRITICA",
    verifiedPurchase: true,
    actionTaken: "Jefatura de Operaciones autorizó asignación de cuadrillas con motos eléctricas para zona céntrica.",
  },
  {
    id: "REV-104",
    serviceOrProductId: 7,
    targetName: "Interruptor Diferencial Bipolar 25A Schneider",
    clientName: "Talleres Mecánicos del Sur",
    clientCommune: "San Miguel",
    rating: 5,
    date: "2026-11-05",
    comment: "Repuesto original con sello SEC y código QR de verificación de autenticidad. Se instaló el mismo día.",
    category: "FELICITACION",
    verifiedPurchase: true,
  },
];

const INITIAL_OPERATIONAL_ITEMS: OperationalProductCatalogItem[] = [
  {
    id: 1,
    code: "SRV-EMG-01",
    name: "Visita Técnica Eléctrica de Emergencia",
    category: "Emergencias",
    description: "Diagnóstico certificado en terreno para detección de cortocircuitos, recalentamientos y fallas en tableros.",
    costPrice: 18000,
    salePrice: 34990,
    stock: 99,
    isService: true,
    restrictedCommunes: [],
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    hasMandatoryImage: true,
    reviewCount: 42,
    averageRating: 4.8,
  },
  {
    id: 2,
    code: "SRV-TAB-02",
    name: "Mantención Preventiva de Tablero General (TDA/TG)",
    category: "Tableros & Potencia",
    description: "Inspección termográfica infrarroja, reapriete con torquímetro, balanceo de fases y pruebas de disparo diferencial.",
    costPrice: 32000,
    salePrice: 64990,
    stock: 99,
    isService: true,
    restrictedCommunes: [],
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    hasMandatoryImage: true,
    reviewCount: 38,
    averageRating: 4.9,
  },
  {
    id: 3,
    code: "SRV-SEC-03",
    name: "Normalización Eléctrica y Tramitación TE1 (SEC)",
    category: "Certificación SEC",
    description: "Levantamiento de planos, actualización de cuadros de carga y declaración oficial ante la SEC con firma Clase A.",
    costPrice: 95000,
    salePrice: 189990,
    stock: 99,
    isService: true,
    restrictedCommunes: [],
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    hasMandatoryImage: true,
    reviewCount: 19,
    averageRating: 4.7,
  },
  {
    id: 4,
    code: "SRV-GEN-04",
    name: "Mantención y Prueba de Grupo Electrógeno",
    category: "Generadores",
    description: "Revisión de alternador, cambio de filtros, verificación de batería y simulación de transferencia automática (TTA).",
    costPrice: 68000,
    salePrice: 129990,
    stock: 99,
    isService: true,
    restrictedCommunes: ["San José de Maipo"], // Restringido en zonas de difícil acceso
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    hasMandatoryImage: true,
    reviewCount: 15,
    averageRating: 4.6,
  },
  {
    id: 7,
    code: "REP-DIF-25",
    name: "Interruptor Diferencial Bipolar 25A 30mA Schneider",
    category: "Repuestos",
    description: "Protección diferencial clase AC para instalaciones residenciales y comerciales con certificado SEC vigente.",
    costPrice: 13500,
    salePrice: 22990,
    stock: 24,
    isService: false,
    restrictedCommunes: [],
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    hasMandatoryImage: true,
    reviewCount: 28,
    averageRating: 4.9,
  },
  {
    id: 8,
    code: "REP-AUT-16",
    name: "Automático Termomagnético 16A Curva C Legrand",
    category: "Repuestos",
    description: "Disyuntor modular 1 Polo + Neutro capacidad de ruptura 6kA certificado según norma NCh 4/2003.",
    costPrice: 5200,
    salePrice: 8990,
    stock: 45,
    isService: false,
    restrictedCommunes: [],
    imageUrl: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80",
    hasMandatoryImage: true,
    reviewCount: 31,
    averageRating: 4.8,
  },
  {
    id: 11,
    code: "SRV-LAV-05",
    name: "Revisión Eléctrica de Lavadora Industrial + Limpieza Dieléctrica",
    category: "Emergencias",
    description: "Ingresado recientemente desde el área operativa. Requiere enriquecimiento de imagen de marketing obligatoria para venta web.",
    costPrice: 35000,
    salePrice: 69990,
    stock: 12,
    isService: true,
    restrictedCommunes: ["Til Til", "San José de Maipo"],
    imageUrl: "", // Pendiente de imagen por marketing
    hasMandatoryImage: false,
    reviewCount: 0,
    averageRating: 0,
  },
];

const CommercialContext = createContext<CommercialContextType | undefined>(undefined);

export const CommercialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addOrder } = useOrders();

  const [quotes, setQuotes] = useState<CommercialQuote[]>(() => {
    try {
      const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_QUOTES;
    } catch {
      return INITIAL_QUOTES;
    }
  });

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    try {
      const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [reviews, setReviews] = useState<ServiceReview[]>(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [operationalItems, setOperationalItems] = useState<OperationalProductCatalogItem[]>(() => {
    try {
      const stored = localStorage.getItem(OP_ITEMS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_OPERATIONAL_ITEMS;
    } catch {
      return INITIAL_OPERATIONAL_ITEMS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
    } catch {}
  }, [quotes]);

  useEffect(() => {
    try {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    } catch {}
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(OP_ITEMS_STORAGE_KEY, JSON.stringify(operationalItems));
    } catch {}
  }, [operationalItems]);

  const totalSalesMonth = quotes
    .filter((q) => q.status === "APROBADA_POR_CLIENTE")
    .reduce((acc, q) => acc + q.total, 2450000);

  const totalQuotes = quotes.length;
  const approvedQuotes = quotes.filter((q) => q.status === "APROBADA_POR_CLIENTE").length;
  const conversionRate = totalQuotes > 0 ? Math.round((approvedQuotes / totalQuotes) * 100) : 0;
  const activeCampaignsCount = campaigns.filter((c) => c.status === "APROBADA").length;

  const kpis: CommercialKpis = {
    totalSalesMonth,
    totalQuotes,
    approvedQuotes,
    conversionRate,
    slaCompliancePercent: 94.6,
    activeCampaigns: activeCampaignsCount,
    topCommunes: [
      { commune: "Maipú", ordersCount: 28, totalSales: 1890000 },
      { commune: "Santiago Centro", ordersCount: 21, totalSales: 1390000 },
      { commune: "Providencia", ordersCount: 16, totalSales: 1120000 },
      { commune: "Las Condes", ordersCount: 14, totalSales: 1450000 },
      { commune: "Puente Alto", ordersCount: 11, totalSales: 890000 },
    ],
    sellerPerformances: [
      {
        sellerName: "Rodrigo Valenzuela (Maipú / Poniente)",
        quotesCount: 22,
        approvedCount: 17,
        salesTotal: 2540000,
        conversion: 77.3,
      },
      {
        sellerName: "Elizabeth Aguirre (Santiago Centro)",
        quotesCount: 16,
        approvedCount: 12,
        salesTotal: 1980000,
        conversion: 75.0,
      },
      {
        sellerName: "Antuan Andrés Jury (Oriente)",
        quotesCount: 14,
        approvedCount: 9,
        salesTotal: 1450000,
        conversion: 64.3,
      },
    ],
  };

  const createQuote = (
    quoteData: Omit<CommercialQuote, "id" | "createdAt" | "status" | "subtotal" | "iva" | "total" | "syncStatus">,
    asDraft: boolean = false
  ): CommercialQuote => {
    const subtotal = quoteData.items.reduce((sum, it) => sum + it.subtotal, 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    const sequenceNumber = quotes.length + 13;
    const formattedId = `#COT-${sequenceNumber.toString().padStart(7, "0")}`;

    const newQuote: CommercialQuote = {
      ...quoteData,
      id: formattedId,
      createdAt: new Date().toISOString(),
      status: asDraft ? "BORRADOR" : "PENDIENTE_APROBACION",
      syncStatus: "SINCRONIZADO",
      subtotal,
      iva,
      total,
    };

    setQuotes((prev) => [newQuote, ...prev]);
    return newQuote;
  };

  const sendQuoteEmail = (quoteId: string): boolean => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: "PENDIENTE_APROBACION" } : q))
    );
    return true;
  };

  const approveQuoteAndConvertToOrder = (quoteId: string): ClientOrder | null => {
    const targetQuote = quotes.find((q) => q.id === quoteId);
    if (!targetQuote) return null;

    const newOrderId = `DF-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItems: ClientOrderItem[] = targetQuote.items.map((it) => ({
      productId: it.productId,
      code: it.code,
      name: it.name,
      category: it.category,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    }));

    const clientOrder: ClientOrder = {
      id: newOrderId,
      numericId: Date.now(),
      createdAt: new Date().toISOString(),
      status: "CREADA",
      serviceTitle: targetQuote.jobTitle || targetQuote.items[0]?.name || "Servicio Eléctrico",
      categoryBadge: targetQuote.items[0]?.category || "Servicios Eléctricos",
      address: targetQuote.clientAddress,
      commune: targetQuote.clientCommune,
      clientRut: targetQuote.clientRut,
      clientName: targetQuote.clientName,
      totalAmount: targetQuote.total,
      deliveryDateEstimate: "Cuadrilla coordinada para hoy antes de las 18:00 hrs",
      technicianName: "Juan Pablo Soto (Cuadrilla Maipú 01)",
      technicianSecLicense: "Instalador SEC Clase A N° 45.291",
      technicianTeam: "Cuadrilla Alfa Terreno",
      technicianVehicle: "Furgón Hyundai Porter H-102 (Patente: KJ-82-19)",
      technicianPhone: "+56 9 8765 4321",
      items: orderItems,
      notes: `Generada por cotización aprobada ${targetQuote.id}. Asesor: ${targetQuote.sellerName}`,
      trackingSteps: [
        {
          status: "CREADA",
          label: "Orden Creada",
          subtitle: `Cotización ${targetQuote.id} aprobada por cliente`,
          completed: true,
          current: true,
          timestamp: "Recién",
        },
        {
          status: "ASIGNADA",
          label: "Cuadrilla Asignada",
          subtitle: "Técnico SEC Clase A en preparación",
          completed: false,
          current: false,
        },
        {
          status: "EN_DESPLAZAMIENTO",
          label: "En Desplazamiento",
          subtitle: `En ruta a ${targetQuote.clientCommune}`,
          completed: false,
          current: false,
        },
        {
          status: "EN_EJECUCION",
          label: "En Ejecución",
          subtitle: "Trabajos en terreno",
          completed: false,
          current: false,
        },
        {
          status: "CERRADA",
          label: "Completada y Certificada",
          subtitle: "Informe final con firma SEC",
          completed: false,
          current: false,
        },
      ],
    };

    addOrder(clientOrder);

    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? { ...q, status: "APROBADA_POR_CLIENTE", convertedOrderId: newOrderId }
          : q
      )
    );

    return clientOrder;
  };

  const rejectQuote = (quoteId: string, reason: string): boolean => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              status: "RECHAZADA_POR_CLIENTE",
              notes: `${q.notes ? q.notes + " | " : ""}Rechazada por cliente: ${reason}`,
            }
          : q
      )
    );
    return true;
  };

  const createCampaign = (
    campaignData: Omit<MarketingCampaign, "id" | "createdAt" | "status">
  ): MarketingCampaign => {
    const newCampaign: MarketingCampaign = {
      ...campaignData,
      id: `CMP-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: "PENDIENTE_APROBACION",
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    return newCampaign;
  };

  const approveCampaign = (campaignId: string, notes?: string): boolean => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              status: "APROBADA",
              reviewedBy: "Carlos Henríquez (Jefe de Ventas)",
              reviewedAt: new Date().toISOString(),
              reviewNotes: notes || "Aprobada para publicación inmediata en portal cliente.",
            }
          : c
      )
    );
    return true;
  };

  const rejectCampaign = (campaignId: string, notes: string): boolean => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              status: "RECHAZADA",
              reviewedBy: "Carlos Henríquez (Jefe de Ventas)",
              reviewedAt: new Date().toISOString(),
              reviewNotes: notes,
            }
          : c
      )
    );
    return true;
  };

  const addReview = (reviewData: Omit<ServiceReview, "id" | "date">): ServiceReview => {
    const newReview: ServiceReview = {
      ...reviewData,
      id: `REV-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split("T")[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    return newReview;
  };

  const updateOperationalItemImage = (
    itemId: number,
    imageUrl: string,
    newDescription?: string
  ): boolean => {
    setOperationalItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              imageUrl,
              hasMandatoryImage: !!imageUrl.trim(),
              description: newDescription || item.description,
            }
          : item
      )
    );
    return true;
  };

  return (
    <CommercialContext.Provider
      value={{
        quotes,
        campaigns,
        communesCoverage: COMMUNES_COVERAGE,
        reviews,
        operationalItems,
        kpis,
        createQuote,
        sendQuoteEmail,
        approveQuoteAndConvertToOrder,
        rejectQuote,
        createCampaign,
        approveCampaign,
        rejectCampaign,
        addReview,
        updateOperationalItemImage,
      }}
    >
      {children}
    </CommercialContext.Provider>
  );
};

export const useCommercial = (): CommercialContextType => {
  const context = useContext(CommercialContext);
  if (!context) {
    throw new Error("useCommercial debe usarse dentro de un CommercialProvider");
  }
  return context;
};
