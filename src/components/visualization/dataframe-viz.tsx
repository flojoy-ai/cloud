import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import LinePlot from "~/components/visualization/plot/line-plot";
import { type SelectTest } from "~/types/test";
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
import { explorerConfig } from "~/types/data";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useState } from "react";
import { type SelectDevice } from "~/types/device";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  measurements: (SelectMeasurement & { device: SelectDevice })[];
  selectedTest: SelectTest;
  everythingSelected: boolean;
};

type FormSchema = z.infer<typeof explorerConfig.dataframe>;

const DataFrameViz = ({
  measurements,
  selectedTest,
  everythingSelected,
}: Props) => {
  const columnNames =
    measurements[0] && measurements[0].data.type === "dataframe"
      ? Object.keys(measurements[0].data.dataframe)
      : [];
  console.log(columnNames);
  const form = useForm<FormSchema>({
    resolver: zodResolver(explorerConfig.dataframe),
    defaultValues: {
      mode: "lines",
    },
    // defaultValues: {
    //   xColumn: columnNames[0],
    //   yColumn: columnNames[1],
    // },
  });

  const validateYColumn = (val: string) => {
    const meas = measurements[0];
    if (!meas) {
      return true;
    }
    if (meas.data.type !== "dataframe") {
      return "Measurements aren't dataframes, this shouldn't happen";
    }
    const data = meas.data.dataframe[val];
    if (data === undefined) {
      return "Invalid column";
    }
    if (typeof data[0] !== "number") {
      return "Y data must be numeric";
    }
    return true;
  };

  const router = useRouter();

  const [config, setConfig] = useState<FormSchema>(form.getValues());

  const onSubmit: SubmitHandler<FormSchema> = (vals) => {
    const res = validateYColumn(vals.yColumn);
    if (res !== true) {
      form.setError("yColumn", { type: "custom", message: res });
      return;
    }

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
                  name="xColumn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X Column</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue
                              placeholder="X Column"
                              className="text-muted-foreground"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {columnNames.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yColumn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Y Column</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Y Column" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {columnNames.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

      {everythingSelected && measurements && (
        <LinePlot
          title={selectedTest?.name ?? "Untitled Test"}
          lines={
            measurements.map((measurement) => {
              if (measurement.data.type === "dataframe") {
                return {
                  x: config.xColumn
                    ? measurement.data.dataframe[config.xColumn] ?? []
                    : [],
                  y: config.yColumn
                    ? (measurement.data.dataframe[
                        config.yColumn
                      ] as number[]) ?? []
                    : [],
                  name: measurement.device.name,
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
    </>
  );
};

export default DataFrameViz;
