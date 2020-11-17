import React, { PropsWithChildren, ReactElement, ReactNode } from 'react';
import cx from 'classnames';

import Loader from '../Loader';

export type TextAlign = 'left' | 'right' | 'center';

export interface Column<Item> {
  accessor?: string,
  cell?: (item: Item) => ReactNode,
  header?: string,
  width?: string | number,
  textAlign?: TextAlign
}

interface Props<Item> {
  columns: Column<Item>[],
  items: Item[],
  className?: string,
  loading?: boolean,
  noDataMessage?: string,
  stickyHeader?: boolean,
}

const Table = <Item, >(props: PropsWithChildren<Props<Item>>): ReactElement => {
  const { columns, items, className, loading = false, noDataMessage = 'No data available', stickyHeader = false } = props;
  
  if (!loading && items.length === 0) {
    return (
      <div className="no-data">
        {noDataMessage}
      </div>
    )
  }

  return (
    <Loader loading={loading}>
      <table data-testid="table" className={cx('table', className)}>
        <thead>
          <tr>
            {
              columns.map((column, index) => (
                <th
                  key={`${column.header}-${index}`}
                  className={cx({ sticky: !!stickyHeader })}
                  style={{
                    width: column.width || 'unset',
                    textAlign: column.textAlign || 'left',
                  }}
                >
                  {column.header}
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            items.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {
                  columns.map((column, columnIndex) => (
                    <td
                      key={`${rowIndex}-${columnIndex}`}
                      style={{
                        width: column.width || 'unset',
                        textAlign: column.textAlign || 'left',
                      }}
                    >
                      {
                        (() => {
                          if (column.accessor) return Object(item as unknown)[column.accessor];
                          if (column.cell) return column.cell(item);
                        })()
                      }
                    </td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
    </Loader>
  )
};

export default Table;
