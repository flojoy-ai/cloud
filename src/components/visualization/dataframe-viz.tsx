import { Card } from "~/components/ui/card";
import LinePlot from "~/components/visualization/plot/line-plot";
import { type SelectTest } from "~/types/test";
import { type SelectMeasurement } from "~/types/measurement";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import { type z } from "zod";
import { explorerConfig } from "~/types/data";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type ToggleCollapsibleProps = {
  children: React.ReactNode;
  name: string;
};

const ToggleCollapsible = ({ name, children }: ToggleCollapsibleProps) => {
  return (
    <Collapsible className="w-full space-y-2">
      <div className="flex items-center space-x-4">
        <h4 className="text-sm font-semibold">{name}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

type Props = {
  measurements: SelectMeasurement[];
  selectedTest: SelectTest;
  everythingSelected: boolean;
};

type FormSchema = z.infer<typeof explorerConfig.dataframe>;

const DataFrameViz = ({
  measurements,
  selectedTest,
  everythingSelected,
}: Props) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(explorerConfig.dataframe),
    defaultValues: {
      errorPercentage: 10,
    },
  });

  const router = useRouter();

  const [config, setConfig] = useState<FormSchema>(form.getValues());

  const onSubmit: SubmitHandler<FormSchema> = (vals) => {
    setConfig(vals);
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <ToggleCollapsible name="Control Limits">
            <div className="flex gap-x-8">
              <FormField
                control={form.control}
                name="upperControlLimit"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormLabel className="font-bold text-muted-foreground">
                        Upper control limit ={" "}
                      </FormLabel>
                      <FormControl className="w-40">
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          {...form.register("upperControlLimit", {
                            setValueAs: (val: string) =>
                              val !== "" ? parseFloat(val) : undefined,
                          })}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lowerControlLimit"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormLabel className="font-bold text-muted-foreground">
                        Lower control limit ={" "}
                      </FormLabel>
                      <FormControl className="w-40">
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          {...form.register("lowerControlLimit", {
                            setValueAs: (val: string) =>
                              val !== "" ? parseFloat(val) : undefined,
                          })}
                        ></Input>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ToggleCollapsible>
          <ToggleCollapsible name="Transform Functions">
            <div className="flex gap-x-8">
              <FormField
                control={form.control}
                name="yTransform"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormLabel className="font-bold text-muted-foreground">
                        yT ={" "}
                      </FormLabel>
                      <FormControl className="w-40">
                        <Input {...field}></Input>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="upperControlLimitTransform"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormLabel className="font-bold text-muted-foreground">
                        UCL_T ={" "}
                      </FormLabel>
                      <FormControl className="w-40">
                        <Input {...field}></Input>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lowerControlLimitTransform"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormLabel className="font-bold text-muted-foreground">
                        LCL_T ={" "}
                      </FormLabel>
                      <FormControl className="w-40">
                        <Input {...field}></Input>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ToggleCollapsible>
          <div className="flex items-center gap-x-8">
            <FormField
              control={form.control}
              name="logScaleYAxis"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-x-2">
                    <FormLabel className="font-bold text-muted-foreground">
                      Log y-axis
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="errorBars"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-x-2">
                    <FormLabel className="font-bold text-muted-foreground">
                      Error bars
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="errorPercentage"
              render={({ field }) =>
                form.watch("errorBars") ? (
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          className="h-8 w-16 p-2"
                          {...field}
                          {...form.register("errorPercentage", {
                            setValueAs: (val: string) =>
                              val !== "" ? parseFloat(val) : undefined,
                          })}
                        />
                      </FormControl>
                      <FormLabel className="font-bold text-muted-foreground">
                        %
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                ) : (
                  <div className="py-4" />
                )
              }
            />
          </div>
          <div className="py-1" />
          <Button type="submit">Replot</Button>
        </form>
      </Form>
      {everythingSelected && measurements && (
        <LinePlot
          title={selectedTest?.name ?? "Untitled Test"}
          lines={
            measurements.map((measurement) => {
              if (measurement.data.type === "dataframe") {
                return {
                  x: measurement.data.dataframe.x ?? [],
                  y: measurement.data.dataframe.y ?? [],
                  name: measurement.deviceId,
                };
              }
              return { x: [], y: [], name: "" };
            }) ?? []
          }
          config={config}
          onTraceClick={(e) => {
            const curveNumber = e.points[0]?.curveNumber;
            if (!curveNumber) {
              return;
            }
            const measurement = measurements[curveNumber];
            if (!measurement) {
              return;
            }
            router.push(`/device/${measurement.deviceId}`);
          }}
        />
      )}
    </Card>
  );
};

export default DataFrameViz;
