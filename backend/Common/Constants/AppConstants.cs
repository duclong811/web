namespace WebCafe.Backend.Common.Constants
{
    public static class AppRoles
    {
        public const string SystemAdmin = "SystemAdmin";
        public const string TenantOwner = "Owner";
        public const string Manager = "Manager";
        public const string Staff = "Staff";
        public const string Kitchen = "Kitchen";
        public const string Cashier = "Cashier";
    }

    public static class OrderStatus
    {
        public const string Pending = "pending";
        public const string Confirmed = "confirmed";
        public const string Preparing = "preparing";
        public const string Ready = "ready";
        public const string Served = "served";
        public const string Paid = "paid";
        public const string Cancelled = "cancelled";
    }

    public static class PaymentMethods
    {
        public const string Cash = "cash";
        public const string VietQR = "vietqr";
        public const string Momo = "momo";
        public const string BankTransfer = "bank_transfer";
    }

    public static class PaymentStatuses
    {
        public const string Pending = "pending";
        public const string Completed = "completed";
        public const string Failed = "failed";
    }

    public static class TableStatuses
    {
        public const string Available = "Available";
        public const string Occupied = "Occupied";
        public const string Reserved = "Reserved";
    }

    public static class DiscountTypes
    {
        public const string Percent = "percent";
        public const string Fixed = "fixed";
    }
}
