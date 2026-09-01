export const dateUtils = {
  /**
   * التحقق من قاعدة 15 يوم - الحجز يجب أن يكون قبل البداية بـ 15 يوم على الأقل
   */
  isValidBookingDate(tripStartDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripDate = new Date(tripStartDate);
    tripDate.setHours(0, 0, 0, 0);

    // حساب الفرق بالأيام
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // يجب أن يكون الفرق >= 15 يوم
    return diffDays >= 15;
  },

  /**
   * الحصول على الحد الأدنى لتاريخ الحجز (اليوم + 15 يوم)
   */
  getMinimumBookingDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date;
  },

  /**
   * التحقق من أن التاريخ في المستقبل
   */
  isFutureDate(date: Date): boolean {
    return new Date(date) > new Date();
  },

  /**
   * حساب عدد الأيام بين تاريخين
   */
  daysBetween(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * تنسيق التاريخ
   */
  formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  },

  /**
   * تحويل التاريخ لـ readable format
   */
  formatDateReadable(date: Date): string {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * الحصول على تاريخ بعد عدد معين من الأيام
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * التحقق من أن التاريخ قريب (أقل من N أيام)
   */
  isDateWithinDays(date: Date, days: number): boolean {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays >= 0;
  },
};
