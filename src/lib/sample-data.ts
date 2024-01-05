import papa from "papaparse";

const parseColumns = async (file: string) => {
  return new Promise(function (resolve, reject) {
    papa.parse<Record<string, unknown[]>>(file, {
      complete: (results) => {
        const columnData: Record<string, unknown[]> = {};

        results.data.forEach((row) => {
          Object.keys(row).forEach((key) => {
            let col = columnData[key];
            if (col === undefined) {
              col = [];
              columnData[key] = col;
            }
            col.push(row[key]);
          });
        });

        resolve(columnData);
      },
      error: reject,
      delimiter: ",",
      dynamicTyping: true,
      skipEmptyLines: true,
      header: true,
    });
  });
};

export const getSampleData = async (file: string) => {
  const res = await fetch(file);
  const text = await res.text();
  return await parseColumns(text);
};

type Dataframe = Record<string, number[] | string[]>;

export const getPsdData = async () => {
  const psdData = (await getSampleData("/psd.csv")) as Dataframe;

  const firstCol = psdData[""];
  if (firstCol === undefined) {
    throw new Error("This shouldn't happen");
  }

  const psdXVals = firstCol.slice(1) as number[];
  delete psdData[""];

  const psdPassFail = Object.values(psdData).map((c) =>
    c[0] === "True" ? true : false,
  );

  const psdYVals = Object.values(psdData).map((c) => c.slice(1));

  return {
    deviceNames: Object.keys(psdData),
    x: psdXVals,
    y: psdYVals,
    passFail: psdPassFail,
  };
};
