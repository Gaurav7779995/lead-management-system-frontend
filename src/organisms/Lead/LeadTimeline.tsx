const LeadTimeline = ({ timeline = [] }: any) => {
  return (
    <div className="relative border-l-2 border-gray-300 ml-4">

      {timeline.length === 0 && (
        <p style={{ color: "#999", padding: "10px" }}>
          No activity found
        </p>
      )}

      {timeline.map((item: any, i: number) => (
        <div key={i} className="mb-6 ml-4 relative">

          {/* DOT */}
          <div
            className={`absolute w-3 h-3 rounded-full -left-1.5
            ${
              item.type === "created"
                ? "bg-blue-500"
                : item.type === "status_changed"
                ? "bg-yellow-500"
                : item.type === "assigned"
                ? "bg-purple-500"
                : item.type === "note_added"
                ? "bg-green-500"
                : "bg-gray-400"
            }`}
          ></div>

          {/* TIME */}
          <p className="text-sm text-gray-500">
            {new Date(item.time).toLocaleString()}
          </p>

          {/* MESSAGE */}
          <h3 className="font-semibold">{item.message}</h3>

          {/* USER */}
          <p className="text-xs text-gray-400">
            by {item.addedBy?.name || "System"}
          </p>

        </div>
      ))}
    </div>
  );
};

export default LeadTimeline;