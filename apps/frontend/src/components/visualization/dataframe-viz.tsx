"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@cloud/ui/components/ui/card";
import LinePlot from "~/components/visualization/plot/line-plot";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm, useFieldArray } from "react-hook-form";

import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cloud/ui/components/ui/form";

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
} from "@cloud/ui/components/ui/select";
import _ from "lodash";
import { X } from "lucide-react";
import { SelectMeasurement } from "~/types/measurement";

type Props = {
  measurements: SelectMeasurement[];
  title: string;
  workspaceId: string;
};

type FormSchema = z.infer<typeof explorerConfig.dataframe>;

type DataframeValueType = "string" | "number";

const getDfColType = (df: DataframeData, col: string) => {
  return typeof df.value[col]?.[0] as DataframeValueType | undefined;
};

const getValidColumns = (dataframes: DataframeData[]): [string[], string[]] => {
  const xKeys = [];
  const yKeys = [];

  for (const df of dataframes) {
    const xs = Object.keys(df.value);
    const ys = Object.keys(df.value).filter(
      (col) => getDfColType(df, col) === "number",
    );

    xKeys.push(xs);
    yKeys.push(ys);
  }

  return [_.intersection(...xKeys), _.intersection(...yKeys)];
};

const DataFrameViz = ({ measurements, title, workspaceId }: Props) => {
  const data = measurements
    .map((m) => m.data)
    .filter((data) => data.type === "dataframe") as DataframeData[];

  const [xCols, yCols] = getValidColumns(data);

  const form = useForm<FormSchema>({
    resolver: zodResolver(explorerConfig.dataframe),
    defaultValues: {
      traces: [{ yAxisColumn: undefined, mode: "lines" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "traces",
  });

  const router = useRouter();

  const [config, setConfig] = useState<FormSchema>(form.getValues());

  const onSubmit: SubmitHandler<FormSchema> = (vals) => {
    setConfig(vals);
  };

  const handleRemove = (index: number) => {
    if (fields.length <= 1) {
      return;
    }
    remove(index - 1);
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
              <div>
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
                            {xCols.map((col, idx) => (
                              <SelectItem key={idx} value={col}>
                                {col}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="py-2" />
                {fields.map((field, index) => (
                  <div className="mb-2 flex items-end gap-2" key={index}>
                    <FormField
                      control={form.control}
                      name={`traces.${index}.yAxisColumn` as const}
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
                                {yCols.map((col, idx) => (
                                  <SelectItem key={idx} value={col}>
                                    {col}
                                  </SelectItem>
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
                      name={`traces.${index}.mode` as const}
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
                    <Button size="icon" variant="ghost">
                      <X size={20} onClick={() => handleRemove(index - 1)} />
                    </Button>
                  </div>
                ))}
                <div className="py-2" />
                <Button
                  onClick={() =>
                    append({
                      yAxisColumn: "",
                      mode: "lines",
                    })
                  }
                >
                  Add Trace
                </Button>
              </div>
              <div className="py-4" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
          lineGroups={
            measurements.map((measurement) => {
              const traces = config.traces;
              const lines = [];
              for (const trace of traces) {
                if (
                  measurement.data.type === "dataframe" &&
                  trace.yAxisColumn
                ) {
                  lines.push({
                    x: measurement.data.value[config.xAxisColumn] ?? [],
                    y: (measurement.data.value[trace.yAxisColumn] ??
                      []) as number[],
                    name: measurement.hardware.name,
                    group: trace.yAxisColumn,
                    mode: trace.mode,
                  });
                }
              }
              return lines;
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
