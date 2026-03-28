import { request, gql } from 'graphql-request';

export const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/1744993/privyhire-2/version/latest';

// ─── Queries ─────────────────────────────────────────────────────────────────

export const GET_CANDIDATE_OFFERS = gql`
  query GetCandidateOffers($candidate: Bytes!) {
    applications(where: { candidate_: { id: $candidate } }, orderBy: appliedAt, orderDirection: desc) {
      id
      appliedAt
      job {
        id
        employer
        escrowAmount
        status
        settlement {
          escrowAmount
          settledAt
        }
      }
    }
  }
`;

export const GET_EMPLOYER_ESCROWS = gql`
  query GetEmployerEscrows($employer: Bytes!) {
    jobs(where: { employer: $employer }, orderBy: createdAt, orderDirection: desc) {
      id
      escrowAmount
      status
      createdAt
      settlement {
        candidate
        escrowAmount
        settledAt
      }
    }
  }
`;

export const GET_ALL_JOBS = gql`
  query GetAllJobs {
    jobs(where: { status: "Posted" }, orderBy: createdAt, orderDirection: desc) {
      id
      employer
      escrowAmount
      status
      createdAt
    }
  }
`;

// Deprecated: GET_JOB_APPLICATIONS - Use GET_EMPLOYER_JOBS for nested applicants

export const GET_CANDIDATE = gql`
  query GetCandidate($id: Bytes!) {
    candidate(id: $id) {
      id
      profileSetCount
    }
  }
`;

export const GET_EMPLOYER_JOBS = gql`
  query GetEmployerJobs($employer: Bytes!) {
    jobs(where: { employer: $employer }, orderBy: createdAt, orderDirection: desc) {
      id
      escrowAmount
      status
      createdAt
      applications {
        id
        appliedAt
        candidate {
          id
        }
      }
      settlement {
        candidate
        escrowAmount
        settledAt
      }
    }
  }
`;

export const GET_CANDIDATE_ACTIVITY = gql`
  query GetCandidateActivity($candidate: Bytes!) {
    applications(where: { candidate_: { id: $candidate } }, orderBy: appliedAt, orderDirection: desc, first: 20) {
      id
      appliedAt
      job {
        id
        employer
        status
        escrowAmount
        settlement {
          settledAt
          escrowAmount
        }
      }
    }
  }
`;

export const GET_CANDIDATE_STATS = gql`
  query GetCandidateStats($candidate: Bytes!) {
    applications(where: { candidate_: { id: $candidate } }) {
      id
      job {
        id
        status
        escrowAmount
        settlement {
          escrowAmount
        }
      }
    }
  }
`;

// ─── Fetch helpers ────────────────────────────────────────────────────────────

export const fetchCandidateOffers = async (candidateAddress: string) => {
  return request(SUBGRAPH_URL, GET_CANDIDATE_OFFERS, { candidate: candidateAddress.toLowerCase() });
};

export const fetchEmployerEscrows = async (employerAddress: string) => {
  return request(SUBGRAPH_URL, GET_EMPLOYER_ESCROWS, { employer: employerAddress.toLowerCase() });
};

export const fetchAllOpenJobs = async () => {
  return request(SUBGRAPH_URL, GET_ALL_JOBS);
};

// Deprecated: fetchEmployerApplications - Use fetchEmployerJobs

export const fetchCandidate = async (candidateAddress: string) => {
  console.log("Fetching from URL:", SUBGRAPH_URL);
  try {
    const res = await request(SUBGRAPH_URL, GET_CANDIDATE, { id: candidateAddress.toLowerCase() });
    console.log("Raw GraphQL Response:", res);
    return res;
  } catch (err) {
    console.error("GraphQL Request failed:", err);
    throw err;
  }
};

export const fetchEmployerJobs = async (employerAddress: string) => {
  return request(SUBGRAPH_URL, GET_EMPLOYER_JOBS, { employer: employerAddress.toLowerCase() });
};

export const fetchCandidateActivityLog = async (candidateAddress: string) => {
  try {
    return await request(SUBGRAPH_URL, GET_CANDIDATE_ACTIVITY, { candidate: candidateAddress.toLowerCase() });
  } catch (err) {
    console.error("Activity log fetch failed:", err);
    return { applications: [] };
  }
};

export const GET_ALL_APPLICATIONS = gql`
  query GetAllApplications {
    applications(orderBy: appliedAt, orderDirection: desc, first: 10) {
      id
      appliedAt
      job { id }
      candidate { id }
    }
  }
`;

export const fetchAllApplications = async () => {
  return request(SUBGRAPH_URL, GET_ALL_APPLICATIONS);
};

export const GET_APPLICATIONS_FOR_JOBS = gql`
  query GetApplicationsForJobs($jobIds: [String!]!) {
    applications(where: { job_in: $jobIds }, orderBy: appliedAt, orderDirection: desc) {
      id
      appliedAt
      candidate {
        id
      }
      job {
        id
      }
    }
  }
`;

export const fetchApplicationsForJobs = async (jobIds: string[]) => {
  return request(SUBGRAPH_URL, GET_APPLICATIONS_FOR_JOBS, { jobIds });
};

export const fetchCandidateStats = async (candidateAddress: string) => {
  try {
    return await request(SUBGRAPH_URL, GET_CANDIDATE_STATS, { candidate: candidateAddress.toLowerCase() });
  } catch (err) {
    console.error("Stats fetch failed:", err);
    return { applications: [] };
  }
};
