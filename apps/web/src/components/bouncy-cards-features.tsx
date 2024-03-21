import { type ReactNode } from "react";
import { motion } from "framer-motion";

export const BouncyCardsFeatures = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 ">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:px-8">
        <h2 className="max-w-lg text-4xl font-bold text-muted-foreground md:text-5xl">
          Test more devices faster with our <br />
          <span className="text-primary"> all in one solution</span>
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-xl transition-colors hover:bg-primary/90"
        >
          Learn more
        </motion.button>
      </div>
      <div className="mb-4 grid grid-cols-12 gap-4">
        <BounceCard className="col-span-12 md:col-span-4">
          <CardTitle>Flexible data source connectors</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-violet-400 to-indigo-400 p-4 transition-transform duration-200 group-hover:translate-y-4 group-hover:rotate-[2deg]">
            <span className="block text-center font-semibold text-indigo-50">
              Flojoy Cloud connects to Python, MATLAB, LabVIEW, Rasberry Pi, and
              Flojoy Studio.
            </span>
          </div>
        </BounceCard>
        <BounceCard className="col-span-12 md:col-span-8">
          <CardTitle>Powerful data visualization</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-amber-400 to-orange-400 p-4 transition-transform duration-200 group-hover:translate-y-4 group-hover:rotate-[2deg]">
            <span className="block text-center font-semibold text-orange-50">
              Search, filter, and visualize measurement data. Define control
              limits and share findings as interactive reports.
            </span>
          </div>
        </BounceCard>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <BounceCard className="col-span-12 md:col-span-8">
          <CardTitle>Ludicrous scalability</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-green-400 to-emerald-400 p-4 transition-transform duration-200 group-hover:translate-y-4 group-hover:rotate-[2deg]">
            <span className="block text-center font-semibold text-emerald-50">
              Scale to millions of hardware devices with billions of
              measurements.
            </span>
          </div>
        </BounceCard>
        <BounceCard className="col-span-12 md:col-span-4">
          <CardTitle>Our cloud or yours</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-pink-400 to-red-400 p-4 transition-transform duration-200 group-hover:translate-y-4 group-hover:rotate-[2deg]">
            <span className="block text-center font-semibold text-red-50">
              Use our cloud or deploy on your own AWS, Azure, or on-premises
              VPC.
            </span>
          </div>
        </BounceCard>
      </div>
    </section>
  );
};

const BounceCard = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 0.95, rotate: "-1deg" }}
      className={`group relative min-h-[300px] cursor-pointer overflow-hidden rounded-2xl bg-secondary p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};

const CardTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h3 className="mx-auto text-center text-3xl font-semibold">{children}</h3>
  );
};
