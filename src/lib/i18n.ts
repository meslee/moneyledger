export type Language = 'en' | 'ko';

export const translations = {
    en: {
        // Layout & Navigation
        dashboard: "Dashboard",
        transactions: "Transactions",
        statistics: "Statistics",
        settings: "Settings",

        // Dashboard
        totalBalance: "Total Balance",
        monthlyIncome: "Monthly Income",
        monthlyExpenses: "Monthly Expenses",
        savingsRate: "Savings Rate",
        recentTransactions: "Recent Transactions",
        noTransactions: "No transactions found",

        // Transaction List
        addTransaction: "Add Transaction",
        date: "Date",
        category: "Category",
        description: "Description",
        amount: "Amount",
        actions: "Actions",
        save: "Save",
        cancel: "Cancel",
        income: "Income",
        expense: "Expense",
        uncategorized: "Uncategorized",

        // Statistics
        monthlyExpensesTrend: "Monthly Expenses Trend",
        categoryBreakdown: "Category Breakdown",
        topMover: "Top Mover",
        monthOverMonth: "Month over Month",
        last6Months: "Last 6 Months",
        last12Months: "Last 12 Months",
        increasedBy: "increased by",
        decreasedBy: "decreased by",
        comparedToLastMonth: "compared to last month",

        // Settings
        appSettings: "App Settings",
        language: "Language",
        selectLanguage: "Select Language",
        categories: "Categories",
        manageCategories: "Manage Categories",
        addCategory: "Add Category",
        categoryName: "Category Name",
        type: "Type",
        color: "Color",
        delete: "Delete",
        edit: "Edit",
        dateFormat: "Date Format",
        dateFormatDesc: "Select how dates are displayed across the app.",
        currency: "Currency",
        currencyDesc: "Select your preferred currency.",

        // Common
        loading: "Loading...",
        error: "Error",
        success: "Success",
        // Messages
        categoryInitError: "Category initialization failed. Please refresh.",
        categoryExists: "Category already exists.",
        categoryAddError: "Error adding category.",
        categoryNameExists: "Category name already exists.",
        categoryUpdateError: "Category update failed",
        categoryDeleteHasTransactions: "Cannot delete category because it has associated transactions.",
        categoryDeleteError: "Error deleting category.",

        // Conditional UI Text
        confirmDelete: "Are you sure you want to delete this category?",
        manageCategoriesDesc: "Manage your income and expense categories.",
        isActiveDesc: "Active (Visible in transactions)",
        expenseHistoryDesc: "Analyze your monthly expense history.",
        more: "more",
        less: "less",
        biggestIncrease: "Biggest Increase",
        categoryBreakdownDesc: "Stacked view to see category breakdown over time.",
    },
    ko: {
        // Layout & Navigation
        dashboard: "대시보드",
        transactions: "거래 내역",
        statistics: "통계",
        settings: "설정",

        // Dashboard
        totalBalance: "총 자산",
        monthlyIncome: "월 수입",
        monthlyExpenses: "월 지출",
        savingsRate: "저축률",
        recentTransactions: "최근 거래",
        noTransactions: "거래 내역이 없습니다",

        // Transaction List
        addTransaction: "거래 추가",
        date: "날짜",
        category: "카테고리",
        description: "내용",
        amount: "금액",
        actions: "관리",
        save: "저장",
        cancel: "취소",
        income: "수입",
        expense: "지출",
        uncategorized: "미분류",

        // Statistics
        monthlyExpensesTrend: "월별 지출 추이",
        categoryBreakdown: "카테고리별 분석",
        topMover: "주요 변동",
        monthOverMonth: "전월 대비",
        last6Months: "최근 6개월",
        last12Months: "최근 12개월",
        increasedBy: "증가",
        decreasedBy: "감소",
        comparedToLastMonth: "전월 대비",

        // Settings
        appSettings: "앱 설정",
        language: "언어",
        selectLanguage: "언어 선택",
        categories: "카테고리",
        manageCategories: "카테고리 관리",
        addCategory: "카테고리 추가",
        categoryName: "카테고리명",
        type: "유형",
        color: "색상",
        delete: "삭제",
        edit: "수정",
        dateFormat: "날짜 형식",
        dateFormatDesc: "앱 전체에서 표시될 날짜 형식을 선택하세요.",
        currency: "통화",
        currencyDesc: "선호하는 통화를 선택하세요.",

        // Common
        loading: "로딩 중...",
        error: "오류",
        success: "성공",

        // Messages
        categoryInitError: "카테고리 초기화 저장 실패. 새로고침 해주세요.",
        categoryExists: "이미 존재하는 카테고리입니다.",
        categoryAddError: "카테고리 추가 중 오류가 발생했습니다.",
        categoryNameExists: "이미 존재하는 카테고리 이름입니다.",
        categoryUpdateError: "카테고리 수정 실패",
        categoryDeleteHasTransactions: "이 카테고리를 사용하는 거래 내역이 있어 삭제할 수 없습니다.",
        categoryDeleteError: "카테고리 삭제 중 오류가 발생했습니다.",

        // Conditional UI Text
        confirmDelete: "이 카테고리를 삭제하시겠습니까?",
        manageCategoriesDesc: "수입 및 지출 카테고리를 관리하세요.",
        isActiveDesc: "활성화 (거래 내역에 표시)",
        expenseHistoryDesc: "월별 지출 추이를 분석합니다.",
        more: "증가",
        less: "감소",
        biggestIncrease: "최대 증가",
        categoryBreakdownDesc: "카테고리별 지출 누적 그래프",
    }
};
