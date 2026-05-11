import { motion, AnimatePresence } from "framer-motion";

export default function FormDialog({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed", inset: 0, display: "grid", placeItems: "center",
            padding: "1rem", zIndex: 50,
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(100%, 560px)",
              background: "var(--surface-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "1.25rem",
              padding: "1.75rem",
              boxShadow: "0 25px 80px rgba(0,0,0,0.15)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>{title}</h3>
              <button
                onClick={onClose}
                style={{
                  width: "2rem", height: "2rem", borderRadius: "999px", border: "1px solid var(--border-color)",
                  background: "transparent", cursor: "pointer", display: "grid", placeItems: "center",
                  color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1,
                  transition: "all 0.2s",
                }}
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
