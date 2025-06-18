import { useQuery } from "@tanstack/react-query";
import { BASE_API_URL } from "../hooks/useAuth";
import type { Battle, BattleProblem } from "../types";

export default function OngoingBattle({
  battle,
  auth,
}: {
  battle: Battle;
  auth: { jwt: string };
}) {
  // const startTime = new Date(battle.start_time);
  // const endTime = addMinutes(startTime, battle.duration_min);

  // const fmt = new Intl.DateTimeFormat("en-US", {
  //   dateStyle: "medium",
  //   timeStyle: "short",
  // });

  // const { data: battlePlayers, status: playersStatus } = useQuery<User[]>({
  //   queryKey: ["battles", battle.id, "players"],
  //   queryFn: async () => {
  //     const response = await fetch(
  //       `${BASE_API_URL}/api/battle/${battle.id}/participants`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${auth.jwt}`,
  //         },
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch battle participants");
  //     }
  //     return response.json();
  //   },
  // });

  const { data: battleProblems, status: problemsStatus } = useQuery<
    BattleProblem[]
  >({
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
      <h1 className="text-2xl font-bold mb-4">Ongoing Battle</h1>
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

      <div>
        <h2 className="text-xl font-semibold mb-2">Problems</h2>
        <div className="grid grid-cols-4 gap-4">
          {problemsStatus === "pending" ? (
            <p>Loading problems...</p>
          ) : problemsStatus === "error" ? (
            <p className="text-red-500">Failed to load problems</p>
          ) : (
            battleProblems.map((problem) => (
              <a
                key={problem.id}
                href={`https://codeforces.com/problemset/problem/${problem.contest_id}/${problem.index}`}
                target="_blank"
              >
                <div className="border border-gray-300 p-2 rounded-lg bg-white font-bold hover:bg-gray-100 transition-colors">
                  {problem.contest_id}
                  {problem.index}
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
