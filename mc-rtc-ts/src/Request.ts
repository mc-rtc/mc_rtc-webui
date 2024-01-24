export class Request {
  category : string[];
  name : string;
  payload? : any;
}

export type RequestHandler = (req : Request) => void;
