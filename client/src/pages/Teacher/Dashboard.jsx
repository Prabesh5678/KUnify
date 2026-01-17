import axios from "axios";
import TeacherHeader from "../../components/Teacher/TeacherHeader";

export default function TeacherDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome Teacher</h1>
      <p>This is your dashboard page.</p>
      <button
  onClick={async () => {
    try {
      const res = await axios.get("/api/teacher/is-auth", { withCredentials: true });
      console.log("Teacher API response:", res.data);
    } catch (err) {
      console.error(err.response || err);
    }
  }}
>
  Test Teacher Auth
</button>

    </div>
  );
}
