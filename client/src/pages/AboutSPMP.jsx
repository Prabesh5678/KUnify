
const AboutSPMP = () => {
  return (
    <div className="px-6 md:px-16 py-12 bg-gray-100 min-h-screen">
      <div className="about-us border rounded-lg p-8 bg-white shadow-md max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800 border-b pb-2">About Us</h2>

        <div className="section p-4 bg-gray-50 rounded-md">
          <h3 className="text-xl font-medium mb-2">Our Platform</h3>
          <p>
            Student Project Management Platform is designed to help students manage project proposals, form groups, and
            collaborate with teachers for supervision and feedback.
          </p>
        </div>

        <div className="section p-4 bg-gray-50 rounded-md">
          <h3 className="text-xl font-medium mb-2">Our Goals</h3>
          <ul className="list-disc list-inside">
            <li>Simplify project submission</li>
            <li>Enable seamless group collaboration</li>
            <li>Provide transparent teacher supervision</li>
          </ul>
        </div>

        <div className="section p-4 bg-gray-50 rounded-md">
          <h3 className="text-xl font-medium mb-2">Key Features</h3>
          <ul className="list-disc list-inside">
            <li>Proposal uploads</li>
            <li>Group management</li>
            <li>Teacher feedback and progress tracking</li>
          </ul>
        </div>

        <div className="section p-4 bg-gray-50 rounded-md">
          <h3 className="text-xl font-medium mb-2">Benefits</h3>
          <ul className="list-disc list-inside">
            <li>Streamlined communication</li>
            <li>Enhanced teamwork</li>
            <li>Organized project workflow</li>
          </ul>
        </div>

        <div className="section p-4 bg-gray-50 rounded-md">
          <h3 className="text-xl font-medium mb-2">Our Team</h3>
          <p>
            Developed by the SPMP Team to support academic innovation and student success.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSPMP;
