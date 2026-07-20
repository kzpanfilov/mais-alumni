import { motion } from 'framer-motion';

export default function Timeline({ items }) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="timeline-item"
          initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div className="timeline-year">{item.year}</div>
            <p className="timeline-text">{item.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
