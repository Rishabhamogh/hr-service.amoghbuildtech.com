export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri:
      process.env.DB_URI ||
      'mongodb://localhost:27017/hramoghbuildtech?authSource=amoghbuildtech'
       // 'mongodb://amoghbuildtechDBA:kjX3zimswjP40KON14Bf@10.10.2.97:27017/amoghbuildtech?authSource=amoghbuildtech'//'mongodb://127.0.0.1:27017/amoghbuildtech'
    },
  auth: {
    tokenExpiry: process.env.TOKEN_EXPIRY || '18h',
  },
  piiVault: process.env.PII_VAULT || "http://10.10.2.97:3200",
  financeServiceUrl:process.env.financeServiceUrl || "http://127.0.0.1:3800",
  notificationExpiryInDays:3,
  frontendUrl:"https://crm.amoghbuildtech.com"
});
