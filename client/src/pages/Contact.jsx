const Contact = () => {
  return (
    <section className="mt-16 px-6 md:px-16 py-12 bg-gray-50 text-gray-800 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-primary mb-8">
          Contact Us
        </h1>

        {/* Contact Info */}
        <div className="grid md:grid-cols-1 gap-12 mb-12">
          {/* Emails */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-gray-700">Support & Admin</h2>
            <p>
              <span className="font-medium">Admin Office:</span>{" "}
              <a href="mailto:saugat.singh@ku.edu.np" className="text-primary hover:underline">
                Saugat Singh (saugat.singh@ku.edu.np)
              </a>
            </p>
            <p>
              <span className="font-medium">Office:</span> Lupic Lab
            </p>
            <p>
              <span className="font-medium">Address:</span> Kathmandu University, Dhulikhel, Kavre, Nepal
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;
