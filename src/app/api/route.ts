import { successResponse } from "@/server/common/response";


// Shared health response
const healthResponse = () =>{
    return successResponse({
        message: "API is healthy",
        data:[],
        debug: true,
        
    })
}

export function GET() {
  return healthResponse();
}

export function POST() {
  return healthResponse();
}

export function PUT() {
  return healthResponse();
}

export function DELETE() {
  return healthResponse();
}

export function PATCH() {
  return healthResponse();
}

export function OPTIONS() {
  return healthResponse();
}