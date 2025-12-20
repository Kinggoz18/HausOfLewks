import mongoose from 'mongoose';
import { serverEnvVaiables } from './enviornment.js';

/**
 * Initalize a mongodb connection
 * @returns A mongoDb connection client
 */
const connectToDb = async () => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.js:10',message:'connectToDb entry - checking MongoDB URL',data:{hasMongoDbUrl:!!serverEnvVaiables?.mongoDbUrl,mongoDbUrlLength:serverEnvVaiables?.mongoDbUrl?.length,mongooseReadyState:mongoose.connection.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    if (!serverEnvVaiables?.mongoDbUrl) throw new Error('MongoDb URL is null');

    // Setup connection event listeners for tracking
    mongoose.connection.on('disconnected', () => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.js:16',message:'Mongoose connection disconnected event',data:{readyState:mongoose.connection.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    });
    mongoose.connection.on('error', (err) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.js:20',message:'Mongoose connection error event',data:{errorMessage:err?.message,errorCode:err?.code,readyState:mongoose.connection.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
      // #endregion
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.js:24',message:'Before mongoose.connect - connection state',data:{readyState:mongoose.connection.readyState,readyStateName:['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion
    const mongodb = await mongoose.connect(serverEnvVaiables?.mongoDbUrl);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.js:28',message:'After mongoose.connect - connection established',data:{hasMongodb:!!mongodb,readyState:mongoose.connection.readyState,readyStateName:['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState],host:mongoose.connection.host},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion
    if (!mongodb)
      throw new Error('connectToDb Func: Failed to create MongoDb Client');

    return mongodb.connection.getClient();
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'database.js:34',message:'connectToDb error',data:{errorMessage:error?.message,errorCode:error?.code,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion
    console.error({ error: error?.message });
    throw new Error(error?.message);
  }
};

export default connectToDb;
