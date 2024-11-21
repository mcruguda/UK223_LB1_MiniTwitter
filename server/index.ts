import express, { Express, Request, Response } from "express";
import http from "http";
import { resolve, dirname } from "path";

class Server {
  private _app: Express;
  private _env: string;
}
