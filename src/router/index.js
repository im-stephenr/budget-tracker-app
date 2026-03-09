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
      {
        path: "/dashboard",
        name: "Home",
        component: Home,
        meta: { transition: "slide" },
      },
      {
        path: "/settings",
        name: "Settings",
        component: Settings,
        meta: { transition: "slide" },
      },
      {
        path: "/budget",
        name: "Budget",
        component: Budget,
        meta: { transition: "slide" },
      },
      {
        path: "/profile",
        name: "Profile",
        component: Profile,
        meta: { transition: "slide" },
      },
      {
        path: "/transaction",
        name: "Transaction",
        component: Transaction,
        meta: { transition: "slide" },
      },
      {
        path: "/manage-payment-methods",
        name: "Manage Payment Methods",
        component: ManagePaymentMethods,
        meta: { transition: "slide" },
      },
      {
        path: "/manage-profile",
        name: "Manage Profile",
        component: ManageProfile,
        meta: { transition: "slide" },
      },
      {
        path: "/manage-categories",
        name: "Manage Categories",
        component: ManageCategories,
        meta: { transition: "slide" },
      },
      {
        path: "/manage-purposes",
        name: "Manage Purposes",
        component: ManagePurposes,
        meta: { transition: "slide" },
      },
      {
        path: "/transaction-history",
        name: "Transaction History",
        component: TransactionHistory,
        meta: { transition: "slide" },
      },
      {
        path: "/transaction-edit/:id",
        name: "Edit Transaction",
        component: EditTransaction,
        meta: { transition: "slide" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
