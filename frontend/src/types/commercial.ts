import { ElectricalProduct } from "./product";
import { OrderStatus } from "./order";

export type SystemRole =
  | "CLIENTE"
  | "VENDEDOR"
  | "ASISTENTE_MARKETING"
  | "JEFE_VENTAS";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  rut: string;
  phone: string;
  address: string;
  role: SystemRole;
  commune?: string;
  department?: string;
}

export type QuoteStatus =
  | "BORRADOR"
  | "PENDIENTE_APROBACION"
  | "APROBADA_POR_CLIENTE"
  | "RECHAZADA_POR_CLIENTE";

export interface QuoteItem {
  productId: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isService: boolean;
}

export interface CommercialQuote {
  id: string; // ej: "#COT-0000012"
  createdAt: string;
  expiresAt: string;
  sellerId: string;
  sellerName: string;
  clientName: string;
  clientRut: string;
  clientEmail: string;
  clientPhone: string;
  clientCommune: string;
  clientAddress: string;
  jobTitle: string; // Nombre de la faena / servicio
  serviceTypeTemplate: string; // Plantilla de servicio
  isPriorSiteVisitRequired: boolean; // Muestra / Visita técnica previa
  requiresSecOfficialCertification: boolean; // Certificación SEC
  referenceQuoteId?: string; // Solicitud de referencia
  items: QuoteItem[];
  subtotal: number;
  iva: number; // 19%
  total: number;
  status: QuoteStatus;
  syncStatus: "SINCRONIZADO" | "PENDIENTE_SYNC";
  notes?: string;
  convertedOrderId?: string; // Cuando se aprueba y pasa a orden operativa (DF-XXXX)
}

export type CampaignStatus =
  | "PENDIENTE_APROBACION"
  | "APROBADA"
  | "RECHAZADA";

export interface MarketingCampaign {
  id: string; // ej: "CMP-2026-003"
  createdAt: string;
  createdBy: string;
  title: string;
  description: string;
  associatedItemIds: number[];
  associatedItemNames: string[];
  discountPercentage: number;
  promoPrice: number;
  regularPrice: number;
  validUntil: string;
  referencePhotoUrl: string; // Soporta enlace de Google Drive
  status: CampaignStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
}

export interface CommuneCoverage {
  commune: string;
  activeSquads: number;
  responseTimeMin: string;
  isCovered: boolean;
  highlightZone: boolean;
  zoneRestrictionNotes?: string; // Para casos especiales de servicios restringidos
}

export interface CommercialKpis {
  totalSalesMonth: number;
  totalQuotes: number;
  approvedQuotes: number;
  conversionRate: number;
  slaCompliancePercent: number;
  activeCampaigns: number;
  topCommunes: { commune: string; ordersCount: number; totalSales: number }[];
  sellerPerformances: {
    sellerName: string;
    quotesCount: number;
    approvedCount: number;
    salesTotal: number;
    conversion: number;
  }[];
}

export type ReviewCategory = "FELICITACION" | "MEJORA" | "CRITICA";

export interface ServiceReview {
  id: string;
  serviceOrProductId: number;
  targetName: string;
  clientName: string;
  clientCommune: string;
  rating: number; // 1 a 5
  date: string;
  comment: string;
  category: ReviewCategory;
  verifiedPurchase: boolean;
  actionTaken?: string; // Oportunidad de mejora adoptada
}

export interface OperationalProductCatalogItem {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  isService: boolean;
  restrictedCommunes: string[]; // Zonas con restricción técnica
  imageUrl?: string;
  hasMandatoryImage: boolean;
  reviewCount: number;
  averageRating: number;
}
