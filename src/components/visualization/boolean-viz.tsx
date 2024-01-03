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
import { useForm, type SubmitHandler } from "react-hook-form";

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
import { Button } from "../ui/button";
import { useState } from "react";
import { type SelectDevice } from "~/types/device";

type Props = {
  measurements: (SelectMeasurement & { device: SelectDevice })[];
  selectedTest: SelectTest;
  everythingSelected: boolean;
};

type FormSchema = z.infer<typeof explorerConfig.boolean>;

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

  const [config, setConfig] = useState<FormSchema>(form.getValues());

  const onSubmit: SubmitHandler<FormSchema> = (vals) => {
    setConfig(vals);
    console.log(config);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Visualization Options</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Plot</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="p-2">
        {everythingSelected && measurements && (
          <ScatterPlot
            title={selectedTest?.name ?? "Untitled Test"}
            x={measurements.map(
              form.watch("xAxis") === "device_id"
                ? (measurement) => measurement.device.name
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
      </Card>
    </>
  );
};

export default BooleanViz;
