"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import LinePlot from "~/components/visualization/plot/line-plot";
import { type SelectMeasurement } from "~/types/measurement";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import { type z } from "zod";
import { type DataframeData, explorerConfig } from "~/types/data";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { type SelectHardware } from "~/types/hardware";
import _ from "lodash";

type Props = {
  measurements: (SelectMeasurement & { hardware: SelectHardware })[];
  title: string;
  workspaceId: string;
};

const getValidColumns = (dataframes: DataframeData[]): [string[], string[]] => {
  const validXKeys = [];
  const validYKeys = [];

  for (const df of dataframes) {
    for (const [k, v] of Object.entries(df.value)) {
      if (typeof v[0] === "number") {
        validYKeys.push(k);
      }
      validXKeys.push(k);
    }
  }

  return [_.uniq(validXKeys), _.uniq(validYKeys)];
};

type FormSchema = z.infer<typeof explorerConfig.dataframe>;

const DataFrameViz = ({ measurements, title, workspaceId }: Props) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(explorerConfig.dataframe),
    defaultValues: {
      mode: "lines",
    },
  });

  const router = useRouter();

  const [config, setConfig] = useState<FormSchema>(form.getValues());

  const data = measurements
    .map((m) => m.data)
    .filter((data) => data.type === "dataframe") as DataframeData[];

  const [xCols, yCols] = getValidColumns(data);

  const onSubmit: SubmitHandler<FormSchema> = (vals) => {
    setConfig(vals);
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
                  name="xAxisColumn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X Axis</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {xCols.map((col) => (
                              <SelectItem value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yAxisColumn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Y Axis</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {yCols.map((col) => (
                              <SelectItem value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lines">Line</SelectItem>
                          <SelectItem value="markers">Scatter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="upperControlLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upper control limit</FormLabel>
                      <FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lowerControlLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lower control limit</FormLabel>
                      <FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div></div>
                <FormField
                  control={form.control}
                  name="upperControlLimitTransform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UCL_T</FormLabel>
                      <FormControl>
                        <Input {...field}></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lowerControlLimitTransform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LCL_T</FormLabel>
                      <FormControl>
                        <Input {...field}></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yTransform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>yT</FormLabel>
                      <FormControl>
                        <Input {...field}></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logScaleYAxis"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Log y-axis</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="errorBars"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Error bars</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="errorPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Error percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          {...form.register("errorPercentage", {
                            setValueAs: (val: string) =>
                              val !== "" ? parseFloat(val) : undefined,
                          })}
                          disabled={!form.watch("errorBars")}
                        />
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

      {measurements && (
        <LinePlot
          title={title ?? "Untitled Test"}
          lines={
            measurements.map((measurement) => {
              const xCol = form.watch("xAxisColumn");
              const yCol = form.watch("yAxisColumn");
              if (measurement.data.type === "dataframe" && xCol && yCol) {
                return {
                  x: measurement.data.value[xCol] ?? [],
                  y: (measurement.data.value[yCol] ?? []) as number[],
                  name: measurement.hardware.name,
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
            router.push(
              `/workspace/${workspaceId}/device/${measurement.hardwareId}`,
            );
          }}
        />
      )}
    </>
  );
};

export default DataFrameViz;
