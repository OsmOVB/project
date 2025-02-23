export type StatusValue = {
  backgroundColor: string;
  description: string;
}

export type ListItemDetailProps<T> = {
  data: T;
}

export type ListItemProps<T, U extends string> = {
  data: T;
  status: U;
}
