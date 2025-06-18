import { useQuery } from "@tanstack/react-query";
import { BASE_API_URL } from "../hooks/useAuth";
import type { Battle, User, BattleProblem } from "../types";

export default function FinishedBattle({
  battle,
  auth,
}: {
  battle: Battle;
  auth: { jwt: string };
}) {
  const startTime = new Date(battle.start_time);
  const fmt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const { data: standings, status } = useQuery<
    {
      user: User;
      solved: number;
      penalty: number;
      problemData: Record<
        number,
        {
          wrongSubmissions: number;
          correctSubmissionIntervalSeconds: number;
          solved: boolean;
        }
      >;
    }[]
  >({
    queryKey: ["battle", battle.id, "standings"],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_API_URL}/api/battle/${battle.id}/standings`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.jwt}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch battle standings");
      }
      return response.json();
    },
  });

  const { data: problems, status: problemsStatus } = useQuery<BattleProblem[]>({
    queryKey: ["battles", battle.id, "problems"],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_API_URL}/api/battle/${battle.id}/problems`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.jwt}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch battle problems");
      }
      return response.json();
    },
  });

  return (
    <div className="flex flex-col h-full flex-1 max-w-7xl w-9/12 mx-auto py-2 gap-4">
      <h1 className="text-2xl font-bold mb-4">Finished Battle</h1>
      <div className="grid grid-cols-3 w-full gap-4">
        <div className="flex-1 border border-gray-300 p-2 rounded-lg bg-white text-center">
          Battle Name: <strong>{battle.title}</strong>
        </div>
        <div className="flex-1 border border-gray-300 p-2 rounded-lg bg-white text-center">
          Rating: {battle.min_rating} - {battle.max_rating}
        </div>
        <div className="flex-1 border border-gray-300 p-2 rounded-lg bg-white text-center">
          Problems: {battle.num_problems}
        </div>
      </div>
      <div className="grid grid-cols-2 w-full gap-4">
        <div className="flex-1 border border-gray-300 p-2 rounded-lg bg-white text-center">
          Start: {fmt.format(startTime)}
        </div>
        <div className="flex-1 border border-gray-300 p-2 rounded-lg bg-white text-center">
          Duration: {battle.duration_min} minutes
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Standings</h2>
      {status === "pending" || problemsStatus === "pending" ? (
        <p>Loading standings...</p>
      ) : status === "error" || problemsStatus === "error" ? (
        <p className="text-red-500">Failed to load standings</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  =
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penalty
                </th>
                {problems.map((problem, i) => (
                  <th
                    key={problem.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    P{i + 1}: {problem.contest_id}
                    {problem.index}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((standings, index) => (
                <tr key={standings.user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {standings.user.handle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {standings.solved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {standings.solved > 0 ? standings.penalty : ""}
                  </td>
                  {Object.values(standings.problemData).map((data, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap">
                      {data.solved ? (
                        <span className="text-green-500">+</span>
                      ) : (
                        <span className="text-red-500">
                          {data.wrongSubmissions > 0
                            ? `-${data.wrongSubmissions}`
                            : ""}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* problems */}
      <h2 className="text-xl font-semibold mb-2">Problems</h2>
      {problemsStatus === "pending" ? (
        <p>Loading problems...</p>
      ) : problemsStatus === "error" ? (
        <p className="text-red-500">Failed to load problems</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {problems.map((problem, i) => (
            <a
              key={problem.id}
              href={`https://codeforces.com/problemset/problem/${problem.contest_id}/${problem.index}`}
              target="_blank"
            >
              <div className="border border-gray-300 p-2 rounded-lg bg-white font-bold hover:bg-gray-100 transition-colors">
                P{i + 1}: {problem.contest_id}
                {problem.index}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
