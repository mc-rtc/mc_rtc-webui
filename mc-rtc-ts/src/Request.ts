export class Request {
  category : string[];
  name : string;
  payload? : object;
}

export type RequestHandler = (req : Request) => void;
