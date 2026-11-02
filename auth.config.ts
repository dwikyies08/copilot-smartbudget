// auth.config.ts
// Hapus baris import NextAuthConfig jika itu yang bikin error

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      
      if (isDashboard) {
        return isLoggedIn; // Redirect otomatis ke /login jika false
      }
      return true;
    },
  },
  providers: [], 
}; // Tidak perlu 'satisfies NextAuthConfig' jika error terus