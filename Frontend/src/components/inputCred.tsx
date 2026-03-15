interface props {
  eventNameRef: React.RefObject<HTMLInputElement | null>;
  eventIdRef: React.RefObject<HTMLInputElement | null>;
  emailDomainRef: React.RefObject<HTMLInputElement | null>;
}

export default function InputCred({
  eventNameRef,
  eventIdRef,
  emailDomainRef,
}: props) {
  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Event Name
        </label>
        <input
          type="text"
          ref={eventNameRef}
          placeholder="Hackathon 2026"
          className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:border-white transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Event ID
        </label>
        <input
          type="number"
          placeholder="number"
          ref={eventIdRef}
          className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:border-white transition-all"
        />
      </div>
      <div className="mb-8">
        <label className="block text-sm  font-semibold text-gray-300 mb-3">
          Email Domain
        </label>
        <div className="relative ">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
            @
          </span>
          <input
            type="text"
            ref={emailDomainRef}
            placeholder="mitsgwl.ac.in"
            className="w-full pl-12 pr-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:border-white"
          />
        </div>
      </div>
    </>
  );
}
