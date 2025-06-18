import { useQuery } from "@tanstack/react-query";
import Countdown from "../components/Countdown";
import { BASE_API_URL } from "../hooks/useAuth";
import type { Battle, User } from "../types";

export default function UpcomingBattle({
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

  const { data: battlePlayers, status } = useQuery<User[]>({
    queryKey: ["battleParticipants", battle.id],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_API_URL}/api/battle/${battle.id}/participants`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.jwt}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch battle participants");
      }
      return response.json();
    },
  });

  return (
    <div className="flex flex-col  h-full flex-1 max-w-7xl w-9/12 mx-auto py-2 gap-4">
      <h1 className="text-2xl font-bold mb-4">Upcoming Battle</h1>
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

      {/* countdown */}
      <div className="text-center mt-4">
        <h2 className="text-xl font-semibold mb-2">Battle starts in</h2>
        <Countdown targetTime={startTime} />
      </div>

      <div className="mt-4 flex gap-12">
        <div className="w-sm">
          <h2 className="text-xl font-semibold mb-2">Participants</h2>
          {status === "pending" ? (
            <p>Loading participants...</p>
          ) : status === "error" ? (
            <p className="text-red-500">Failed to load participants</p>
          ) : (
            <div>
              {battlePlayers.map((player) => (
                <div
                  key={player.id}
                  className="p-2 border border-gray-600 rounded mb-2 bg-white font-bold text-gray-500"
                >
                  {player.handle}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Rules</h2>
          <p>
            <ul className="list-disc ml-4">
              <li>
                Problems are randomly chosen from the selected rating range from
                the Codeforces problem set.
              </li>
              <li>
                During the battle, the problem descriptions, and a link to
                submit solutions on Codeforces will be accessible.
              </li>
              <li>
                Submissions made from the verified Codeforces accounts to the
                respective problems within the battle duration will be counted.
              </li>
              <li>
                Standings will be decided similar to Div. 3 Codeforces contests:
                Number of problems solved, then time penalty for each problem.
              </li>
              <li>
                Every non-AC submission with at least one passed test case will
                incur a penalty of 10 minutes. (This holds even if the problem
                description has more than one sample test case.)
              </li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
}
