import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
    {
        projectTitle: {
            type:String, 
            required:true
        },

        projectKeyword: {
            type: String,
            required: true,
        },
        proposal: {
            type: String,
            required: true,
        },
        
    }

);
const Proposal =
  mongoose.models.proposal || mongoose.model("proposal", proposalSchema);

export default Proposal;