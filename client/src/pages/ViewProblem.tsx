import { useParams } from "react-router";

export default function ViewProblem() {
  const { contestId, index } = useParams();

  return (
    <div className="w-8/12 mx-auto py-4 h-screen">
      <iframe
        src={`https://cf-problem.deno.dev/problem/${contestId}/${index}`}
        className="w-full h-full"
        title={`Problem ${index} from Contest ${contestId}`}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        style={{ border: "none" }}
      ></iframe>
    </div>
  );
}
