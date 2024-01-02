import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import ScatterPlot from "~/components/visualization/plot/scatter-plot";
import { type SelectTest } from "~/types/test";
import { type SelectMeasurement } from "~/types/measurement";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type z } from "zod";
import { explorerConfig } from "~/types/data";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type Props = {
  measurements: SelectMeasurement[];
  selectedTest: SelectTest;
  everythingSelected: boolean;
};

const BooleanViz = ({
  measurements,
  selectedTest,
  everythingSelected,
}: Props) => {
  const form = useForm<z.infer<typeof explorerConfig.boolean>>({
    resolver: zodResolver(explorerConfig.boolean),
    defaultValues: {
      xAxis: "device_id",
    },
  });

  function onSubmit(values: z.infer<typeof explorerConfig.boolean>) {
    console.log(values);
  }

  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="xAxis"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>x-axis</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="device_id" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            device_id
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="timestamp" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            timestamp
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

      {everythingSelected && measurements && (
        <ScatterPlot
          title={selectedTest?.name ?? "Untitled Test"}
          x={measurements.map(
            form.watch("xAxis") === "device_id"
              ? (measurement) => measurement.deviceId
              : (measurement) => measurement.createdAt.toISOString(),
          )}
          y={measurements.map((measurement) => {
            if (measurement.data.type === "boolean") {
              return measurement.data.passed ? "passed" : "failed";
            }
            return "";
          })}
        />
      )}
    </div>
  );
};

export default BooleanViz;
