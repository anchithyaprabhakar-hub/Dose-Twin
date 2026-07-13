function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-24">
      <div className="max-w-7xl mx-auto px-8 py-12">

        <div className="grid md:grid-cols-4 gap-10">

          <div>
            <h2 className="text-3xl font-bold text-cyan-400">
              DoseTwin
            </h2>

            <p className="mt-4 text-gray-400">
              AI-powered medicine management for a healthier future.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Product
            </h3>

            <ul className="space-y-2 text-gray-400">
              <li>Medicine Scanner</li>
              <li>AI Chat</li>
              <li>Reminders</li>
              <li>Drug Interaction</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Company
            </h3>

            <ul className="space-y-2 text-gray-400">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Follow Us
            </h3>

            <ul className="space-y-2 text-gray-400">
              <li>GitHub</li>
              <li>LinkedIn</li>
              <li>Twitter</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-700 mt-10 pt-6 text-center text-gray-500">
          © {new Date().getFullYear()} DoseTwin. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;