import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import DefaultLayout from "../views/layouts/DefaultLayout.vue";
import Settings from "../views/Settings.vue";
import Budget from "../views/Budget.vue";
import Profile from "../views/Profile.vue";
import Transaction from "../views/Transaction.vue";
import TransactionHistory from "../views/TransactionHistory.vue";
import EditTransaction from "../views/EditTransaction.vue";
import ManagePaymentMethods from "../views/ManagePaymentMethods.vue";
import ManageCategories from "../views/ManageCategories.vue";
import ManageProfile from "../views/ManageProfile.vue";
import ManagePurposes from "../views/ManagePurposes.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", redirect: "/dashboard" }, // Default route
      { path: "/dashboard", name: "Home", component: Home },
      { path: "/settings", name: "Settings", component: Settings },
      { path: "/budget", name: "Budget", component: Budget },
      { path: "/profile", name: "Profile", component: Profile },
      { path: "/transaction", name: "Transaction", component: Transaction },
      {
        path: "/manage-payment-methods",
        name: "Manage Payment Methods",
        component: ManagePaymentMethods,
      },
      {
        path: "/manage-profile",
        name: "Manage Profile",
        component: ManageProfile,
      },
      {
        path: "/manage-categories",
        name: "Manage Categories",
        component: ManageCategories,
      },
      {
        path: "/manage-purposes",
        name: "Manage Purposes",
        component: ManagePurposes,
      },
      {
        path: "/transaction-history",
        name: "Transaction History",
        component: TransactionHistory,
      },
      {
        path: "/transaction-edit/:id",
        name: "Edit Transaction",
        component: EditTransaction,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
