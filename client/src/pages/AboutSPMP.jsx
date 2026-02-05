const AboutSPMP = () => {
  const teamMembers = [
    { name: "Sushant Bhattari", role: "Backend Developer", image: "/avatar.png" },
    { name: "Prabesh Acharya", role: "Backend Developer", image: "/avatar.png" },
    { name: "Deekshya Badal", role: "Frontend Developer", image: "/avatar.png" },
    { name: "Subhechha Karki", role: "Frontend Designer", image: "/avatar.png" },
    { name: "Sajana Ranjitkar", role: "Backend Developer", image: "/avatar.png" },
  ];

  return (
    <div className="px-6 md:px-16 py-14 min-h-screen bg-gradient-to-br from-gray-100 via-primary/5 to-primary/10">
      <div className="border rounded-xl p-8 bg-white shadow-lg max-w-6xl mx-auto space-y-8">

        <h2 className="text-3xl font-semibold text-primary border-b pb-3">
          About Us
        </h2>

        {[
          {
            title: "Our Platform",
            content:
              "Student Project Management Platform is designed to help students manage project proposals, form groups, and collaborate with teachers for supervision and feedback.",
          },
          {
            title: "Our Goals",
            list: [
              "Simplify project submission",
              "Enable seamless group collaboration",
              "Provide transparent teacher supervision",
            ],
          },
          {
            title: "Key Features",
            list: [
              "Proposal uploads",
              "Group management",
              "Teacher feedback and progress tracking",
            ],
          },
          {
            title: "Benefits",
            list: [
              "Streamlined communication",
              "Enhanced teamwork",
              "Organized project workflow",
            ],
          },
        ].map((section, idx) => (
          <div
            key={idx}
            className="p-5 bg-gray-50 rounded-lg border-l-4 border-primary"
          >
            <h3 className="text-xl font-medium text-primary mb-2">
              {section.title}
            </h3>

            {section.content ? (
              <p className="text-gray-700 leading-relaxed">
                {section.content}
              </p>
            ) : (
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* Our Team */}
        <div className="p-5 bg-gray-50 rounded-lg border-l-4 border-primary">
          <h3 className="text-xl font-bold text-primary mb-6 text-center">
            Our Team
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl shadow-sm text-center border hover:shadow-md transition"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border-4 border-primary/20"
                />
                <h4 className="text-lg font-semibold text-gray-800">
                  {member.name}
                </h4>
                <p className="text-sm text-primary font-medium">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutSPMP;
