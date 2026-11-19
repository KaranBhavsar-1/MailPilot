// const classifications = [
//   {
//     value: "ASSISTANT",
//     label: "Assistant Action",
//   },
//   {
//     value: "CLIENT",
//     label: "Client Action",
//   },
//   {
//     value: "NO_REPLY",
//     label: "No Reply Needed",
//   },
//   {
//     value: "REVIEW",
//     label: "Needs Review",
//   },
// ];

// export default function ClassificationSelect({
//   value,
//   onChange,
//   disabled = false,
// }) {
//   return (
//     <div>
//       <label
//         htmlFor="thread-classification"
//         className="mb-2 block text-sm font-medium text-slate-700"
//       >
//         Current classification
//       </label>

//       <select
//         id="thread-classification"
//         value={value || "REVIEW"}
//         disabled={disabled}
//         onChange={(event) => onChange(event.target.value)}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
//       >
//         {classifications.map((item) => (
//           <option key={item.value} value={item.value}>
//             {item.label}
//           </option>
//         ))}
//       </select>

//       <p className="mt-2 text-xs text-slate-500">
//         Changing this value manually overrides the current AI classification.
//       </p>
//     </div>
//   );
// }


const classifications = [
  {
    value: "ASSISTANT",
    label: "Assistant Action",
  },
  {
    value: "CLIENT",
    label: "Client Action",
  },
  {
    value: "NO_REPLY",
    label: "No Reply Needed",
  },
  {
    value: "REVIEW",
    label: "Needs Review",
  },
];

export default function ClassificationSelect({
  value,
  onChange,
  disabled = false,
  reason,
  onReasonChange,
}) {
  return (
    <div>
      <label
        htmlFor="thread-classification"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Current classification
      </label>

      <select
        id="thread-classification"
        value={value || "REVIEW"}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {classifications.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <div className="mt-4">
        <label
          htmlFor="classification-reason"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Reason for correction
          <span className="ml-1 font-normal text-slate-400">
            (Optional)
          </span>
        </label>

        <textarea
          id="classification-reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          disabled={disabled}
          rows={3}
          maxLength={500}
          placeholder="Explain why you changed the AI recommendation..."
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-right text-xs text-slate-400">
          {reason.length}/500
        </p>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Your selection becomes the current human-approved classification.
        The original AI recommendation remains unchanged.
      </p>
    </div>
  );
}
