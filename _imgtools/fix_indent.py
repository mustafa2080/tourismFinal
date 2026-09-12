import re, glob, os, sys
sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
files = [
    "components/RatingCommentModal.jsx",
    "components/sections/AdvancedImageSlider.jsx",
    "components/sections/ImageSlider.jsx",
    "pages/AdminSetupPage.jsx",
    "pages/CareersPage.jsx",
    "pages/ContactPage.jsx",
    "pages/CustomTripPage.jsx",
    "pages/DashboardPage.jsx",
    "pages/ForgotPasswordPage.jsx",
    "pages/HomePage.jsx",
    "pages/LoginPage.jsx",
    "pages/PackageDetailPage.jsx",
    "pages/ResetPasswordPage.jsx",
    "pages/SignupPage.jsx",
    "pages/AdminDashboard/components/Sidebar.jsx",
    "pages/AdminDashboard/pages/BookingsPage.jsx",
    "pages/AdminDashboard/pages/MyProfilePage.jsx",
    "pages/AdminDashboard/pages/PackagesPage.jsx",
    "pages/AdminDashboard/pages/RefundsPage.jsx",
    "pages/AdminDashboard/pages/ReportsPage.jsx",
    "pages/AdminDashboard/pages/SettingsPage.jsx",
]

for rel in files:
    path = os.path.join(root, rel)
    with open(path, encoding='utf-8') as fh:
        lines = fh.readlines()
    bad = [i+1 for i, l in enumerate(lines) if re.match(r'^ [^\s]', l)]
    if bad:
        print(f"{rel}: single-space-indent lines at {bad}")
