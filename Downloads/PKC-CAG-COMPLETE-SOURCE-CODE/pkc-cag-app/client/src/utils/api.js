// client/src/utils/api.js
import axios from "axios";

// ================================
// AXIOS INSTANCE
// ================================
// Use environment variable for API URL
// BaseURL should point to /api endpoint
const baseURL = process.env.REACT_APP_API_URL || "https://api.pkccag.com/api";
console.log('🔗 API Base URL:', baseURL);
const API = axios.create({
  baseURL: baseURL,
  withCredentials: false, // using JWT, not cookies
});

// ================================
// ATTACH TOKEN ON REQUEST
// ================================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Log order creation requests in detail
  if (config.url.includes('/orders/create')) {
    console.log("🚀 Order API Request:");
    console.log("   URL:", config.url);
    console.log("   Method:", config.method?.toUpperCase());
    console.log("   Content-Type:", config.headers['Content-Type'] || 'application/json (default)');
    console.log("   Data:", JSON.stringify(config.data, null, 2).substring(0, 500));
    console.log("   Token:", token ? `✅ Present (${token.substring(0, 20)}...)` : "❌ Missing");
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug(
      "API Request →",
      config.method?.toUpperCase(),
      config.url,
      "Token attached:",
      !!token
    );
  }

  return config;
});

// ================================
// ERROR HANDLER
// ================================
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const res = err.response;

    if (res) {
      console.error(
        `[${res.config?.method?.toUpperCase()} ${res.config?.url}] → HTTP ${res.status}`,
        res.data?.message || err.message
      );

      // Auto logout on invalid token
      if (res.status === 401) {
        localStorage.removeItem("token");
        delete API.defaults.headers.common["Authorization"];
        console.warn("Token expired or invalid — cleared");
      }
    }

    return Promise.reject(err);
  }
);

// =======================================================
// AUTH API
// =======================================================
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  verifyOTP: (data) => API.post("/auth/verify-otp", data),
  resendOTP: (data) => API.post("/auth/resend-otp", data),
  login: (data) => API.post("/auth/login", data),
  me: () => API.get("/auth/me"),
};

// =======================================================
// SERVICES API
// =======================================================
export const servicesAPI = {
  getAllServices: (params = {}) => API.get("/services", { params }),
  getService: (id) => API.get(`/services/${id}`),
  getServiceById: (id) => API.get(`/services/${id}`),
};

// =======================================================
// ORDERS API
// =======================================================
export const ordersAPI = {
  createOrder: (data) => API.post("/orders/create", data),

  createOrderFormData: (formData) =>
    API.post("/orders/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  verifyPayment: (data) => API.post("/orders/verify", data),
  getMyOrders: () => API.get("/orders/my-orders"),
  getOrderById: (id) => API.get(`/orders/${id}`),
  getAllOrders: () => API.get("/orders/admin/all"),

  exportCSV: () => API.get("/orders/admin/export-csv", { responseType: "blob" }),

  updateOrderStatus: (id, data) =>
    API.put(`/orders/${id}/status`, data),
};

// =======================================================
// ADMIN API
// =======================================================
export const adminAPI = {
  getStats: () => API.get("/admin/stats"),
  ping: () => API.get("/admin/ping"),

  getUsers: (params) => API.get("/admin/users", { params }),
  updateUser: (id, data) => API.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/api/admin/users/${id}`),
  getLogs: (params) => API.get('/api/admin/logs', { params }),

  // ✅ UPDATE SYSTEM
  createUpdate: (data) => API.post("/updates/admin", data),
  getUpdates: () => API.get("/updates/admin"),
  deleteUpdate: (id) => API.delete(`/api/updates/admin/${id}`),
  

  requestWithdrawal: (data) => API.post("/admin/withdrawal-request", data),
  getActivities: (params) => API.get("/admin-enhanced/logs/activity", { params }),
  
  // Admin utilities
  backfillServiceIds: () => API.post('/api/services/admin/backfill-ids'),

  // 💳 PAYMENT SYSTEM
  recordClientPayment: (contractId, data) =>
    API.post(`/api/payments/contracts/${contractId}/record-payment`, data),
  
  // 💳 RAZORPAY PAYMENT
  createPaymentOrder: (contractId, data) =>
    API.post(`/api/payments/razorpay/create-order/${contractId}`, data),
  verifyRazorpayPayment: (contractId, data) =>
    API.post(`/api/payments/razorpay/verify/${contractId}`, data),
  
  requestFundRelease: (contractId, data) =>
    API.post(`/api/payments/contracts/${contractId}/release-funds`, data),
  requestRefund: (contractId, data) =>
    API.post(`/api/payments/contracts/${contractId}/request-refund`, data),
  getPaymentRequests: (params) =>
    API.get('/api/payments/requests', { params }),
  approveFundRelease: (requestId, data) =>
    API.put(`/api/payments/requests/${requestId}/approve-release`, data),
  rejectFundRelease: (requestId, data) =>
    API.put(`/api/payments/requests/${requestId}/reject-release`, data),
  approveRefund: (requestId, data) =>
    API.put(`/api/payments/requests/${requestId}/approve-refund`, data),
  denyRefund: (requestId, data) =>
    API.put(`/api/payments/requests/${requestId}/deny-refund`, data),
  getContractPaymentStatus: (contractId) =>
    API.get(`/api/payments/contracts/${contractId}/status`),
  markPaymentSent: (requestId, data) =>
    API.put(`/api/payments/requests/${requestId}/mark-payment-sent`, data),
  
  // 👨‍💼 FREELANCER APPLICATION
  submitFreelancerApplication: (jobId, data) =>
    API.post(`/api/payments/applications/${jobId}/apply`, data),
  
  // 📝 WORK SUBMISSION
  submitWorkDetails: (contractId, data) =>
    API.post(`/api/payments/contracts/${contractId}/submit-work`, data),
  
  // 📋 CONTRACT MANAGEMENT
  getContracts: (params) => API.get('/api/payments/contracts', { params }),
  getContractById: (contractId) => API.get(`/api/payments/contracts/${contractId}`),
  updateContractStatus: (contractId, data) => API.put(`/api/payments/contracts/${contractId}/status`, data),
  deleteContract: (contractId) => API.delete(`/api/admin/contracts/${contractId}`),
  markPaymentDone: (contractId) => API.put(`/api/admin/contracts/${contractId}/mark-payment-done`),
  closeContract: (contractId) => API.put(`/api/admin/contracts/${contractId}/close`),

  // 📊 ADMIN JOBS MANAGEMENT
  getAllJobs: (params) => API.get('/api/admin/jobs', { params }),
  deleteJobAdmin: (jobId) => API.delete(`/api/admin/jobs/${jobId}`),
};


// =======================================================
// REVIEWS API
// =======================================================
export const reviewAPI = {
  createReview: (data) => API.post("/reviews/create", data),
  getUserReviews: () => API.get("/reviews/my-reviews"),
  getServiceReviews: (serviceId, params) => API.get(`/api/reviews/service/${serviceId}`, { params }),
  markHelpful: (reviewId) => API.post(`/api/reviews/${reviewId}/helpful`),
  markUnhelpful: (reviewId) => API.post(`/api/reviews/${reviewId}/unhelpful`),
  getPendingReviews: (params) => API.get("/reviews/admin/pending", { params }),
  approveReview: (reviewId) => API.put(`/api/reviews/admin/${reviewId}/approve`, {}),
  rejectReview: (reviewId, data) => API.put(`/api/reviews/admin/${reviewId}/reject`, data),
  respondToReview: (reviewId, data) => API.put(`/api/reviews/admin/${reviewId}/respond`, data),
  getReviewStats: (serviceId) => API.get(`/api/reviews/stats/${serviceId}`),
};

// =======================================================
// REFERRAL SYSTEM API
// =======================================================
export const referralAPI = {
  applyReferral: (code) => API.post("/referral/apply", { code }),
  getMyReferralData: () => API.get("/referral/me"),
};

// =======================================================
// WITHDRAWAL SYSTEM API (NEW)
// =======================================================
export const withdrawalAPI = {
  requestWithdrawal: (data) => API.post("/withdrawals/request", data),

  getAll: () => API.get("/withdrawals/all"),

  approve: (id, note) =>
    API.put(`/api/withdrawals/approve/${id}`, { adminNote: note }),

  reject: (id, note) =>
    API.put(`/api/withdrawals/reject/${id}`, { adminNote: note }),
};

// WITHDRAWAL API
export const withdrawAPI = {
  request: (data) => API.post("/withdrawals/request", data),
  getAllWithdrawals: () => API.get("/withdrawals/all"),
  approve: (id) => API.put(`/api/withdrawals/approve/${id}`),
  reject: (id) => API.put(`/api/withdrawals/reject/${id}`),
};

// =======================================================
// FREELANCER MARKETPLACE API
// =======================================================

// Job APIs
export const marketplaceAPI = {
  // ===== JOBS =====
  createJob: (data) => API.post("/marketplace/jobs/create", data),
  getMyJobs: (params) => API.get("/marketplace/jobs/my-jobs", { params }),
  browseJobs: (params) => API.get("/marketplace/jobs/browse", { params }),
  getAllJobs: (params) => API.get("/services", { params }),
  getJobById: (jobId) => API.get(`/api/marketplace/jobs/${jobId}`),
  updateJob: (jobId, data) => API.put(`/api/marketplace/jobs/${jobId}`, data),
  deleteJob: (jobId) => API.delete(`/api/marketplace/jobs/${jobId}`),
  getJobApplications: (jobId, params) => API.get(`/api/marketplace/jobs/${jobId}/applications`, { params }),
  selectFreelancer: (data) => API.post("/marketplace/jobs/select-freelancer", data),
  completeJob: (jobId) => API.put(`/api/marketplace/jobs/${jobId}/complete`),
  cancelJob: (jobId, data) => API.put(`/api/marketplace/jobs/${jobId}/cancel`, data),

  // ===== APPLICATIONS =====
  submitApplication: (data) => API.post("/marketplace/applications/submit", data),
  getMyApplications: (params) => API.get("/marketplace/applications/my-applications", { params }),
  getApplicationById: (applicationId) => API.get(`/api/marketplace/applications/${applicationId}`),
  withdrawApplication: (applicationId) => API.put(`/api/marketplace/applications/${applicationId}/withdraw`),
  rejectApplication: (applicationId, data) => API.put(`/api/marketplace/applications/${applicationId}/reject`, data),
  rateApplication: (applicationId, data) => API.post(`/api/marketplace/applications/${applicationId}/rate`, data),

  // ===== CONTRACTS =====
  createContract: (data) => API.post("/marketplace/contracts/create", data),
  getMyContracts: (params) => API.get("/marketplace/contracts/my-contracts", { params }),
  getContractById: (contractId) => API.get(`/api/marketplace/contracts/${contractId}`),
  processPayment: (contractId, data) => API.post(`/api/marketplace/contracts/${contractId}/payment`, data),
  completeContract: (contractId) => API.put(`/api/marketplace/contracts/${contractId}/complete`),
  cancelContract: (contractId, data) => API.put(`/api/marketplace/contracts/${contractId}/cancel`, data),
  rateFreelancer: (contractId, data) => API.post(`/api/marketplace/contracts/${contractId}/rate`, data),

  // ===== FREELANCER PROFILE =====
  getMyProfile: () => API.get("/marketplace/profile/my-profile"),
  createProfile: (data) => API.post("/marketplace/profile/create", data),
  updateProfile: (data) => API.put("/marketplace/profile/update", data),
  getProfileById: (userId) => API.get(`/api/marketplace/profile/${userId}`),
  addPortfolio: (data) => API.post("/marketplace/profile/portfolio/add", data),
  removePortfolio: (portfolioId) => API.delete(`/api/marketplace/profile/portfolio/${portfolioId}`),
  addCertification: (data) => API.post("/marketplace/profile/certification/add", data),
  browseTalent: (params) => API.get("/marketplace/profile/browse-talent", { params }),
  getFreelancerStats: () => API.get("/marketplace/profile/stats"),

  // ===== DISPUTES =====
  createDispute: (data) => API.post("/marketplace/disputes/create", data),
  getMyDisputes: (params) => API.get("/marketplace/disputes/my-disputes", { params }),
  getDisputeById: (disputeId) => API.get(`/api/marketplace/disputes/${disputeId}`),
  submitDisputeResponse: (disputeId, data) => API.post(`/api/marketplace/disputes/${disputeId}/respond`, data),

  // ===== ADMIN: DISPUTES =====
  getAllDisputes: (params) => API.get("/marketplace/admin/disputes", { params }),
  assignDispute: (disputeId, data) => API.put(`/api/marketplace/admin/disputes/${disputeId}/assign`, data),
  resolveDispute: (disputeId, data) => API.put(`/api/marketplace/admin/disputes/${disputeId}/resolve`, data),
  getDisputeStats: () => API.get("/marketplace/admin/disputes/stats"),
};

// =======================================================
// MESSAGING API
// =======================================================
export const messagingAPI = {
  createConversation: (data) => API.post("/messaging/conversations", data),
  getConversations: (params) => API.get("/messaging/conversations", { params }),
  getConversationMessages: (conversationId, params) => API.get(`/api/messaging/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => API.post(`/api/messaging/conversations/${conversationId}/messages`, data),
  markAsRead: (conversationId) => API.put(`/api/messaging/conversations/${conversationId}/mark-read`),
  deleteConversation: (conversationId) => API.delete(`/api/messaging/conversations/${conversationId}`),
  getUnreadCount: () => API.get("/messaging/unread-count"),
};

export default API;

