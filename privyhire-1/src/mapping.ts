import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  CandidateProfileSet as CandidateProfileSetEvent,
  JobPosted as JobPostedEvent,
  JobApplied as JobAppliedEvent,
  JobSettled as JobSettledEvent,
  JobCancelled as JobCancelledEvent,
  MatchEvaluated as MatchEvaluatedEvent,
} from "../generated/PrivyHire/PrivyHire"
import {
  CandidateRated as CandidateRatedEvent
} from "../generated/PrivyHireReputationVault/PrivyHireReputationVault"
import {
  ReferralRegistered as ReferralRegisteredEvent,
  RewardClaimed as RewardClaimedEvent
} from "../generated/PrivyHireReferrals/PrivyHireReferrals"
import { Candidate, Job, Application, Settlement, MatchOutcome, ReputationRating, Referral, RewardClaim } from "../generated/schema"

export function handleCandidateProfileSet(event: CandidateProfileSetEvent): void {
  let candidateId = event.params.candidate
  let candidate = Candidate.load(candidateId)
  
  if (!candidate) {
    candidate = new Candidate(candidateId)
    candidate.profileSetCount = BigInt.fromI32(0)
  }
  
  candidate.profileSetCount = candidate.profileSetCount.plus(BigInt.fromI32(1))
  candidate.save()
}

export function handleJobPosted(event: JobPostedEvent): void {
  let jobId = event.params.jobId.toString()
  let employer = event.params.employer.toHex()
  let id = employer + "-" + jobId
  
  let job = new Job(id)
  job.employer = event.params.employer
  job.escrowAmount = event.params.escrowAmount
  job.status = "Posted"
  job.createdAt = event.block.timestamp
  job.save()
}

export function handleJobApplied(event: JobAppliedEvent): void {
  let employer = event.params.employer
  let jobId = event.params.jobId.toString()
  let candidateId = event.params.candidate
  
  let candidate = Candidate.load(candidateId)
  if (!candidate) {
    candidate = new Candidate(candidateId)
    candidate.profileSetCount = BigInt.fromI32(0)
    candidate.save()
  }

  let id = employer.toHex() + "-" + jobId
  let job = Job.load(id)
  if (!job) {
    job = new Job(id)
    job.employer = employer
    job.escrowAmount = BigInt.fromI32(0)
    job.status = "Posted"
    job.createdAt = event.block.timestamp
    job.save()
  }

  let appId = id + "-" + candidateId.toHex()
  let application = Application.load(appId)
  if (!application) {
    application = new Application(appId)
  }
  application.job = job.id
  application.candidate = candidate.id
  application.appliedAt = event.block.timestamp
  application.save()
}

export function handleJobSettled(event: JobSettledEvent): void {
  let employer = event.params.employer
  let jobId = event.params.jobId.toString()
  let candidateId = event.params.candidate
  
  let id = employer.toHex() + "-" + jobId
  let job = Job.load(id)
  if (job) {
    job.status = "Settled"
    job.settledAt = event.block.timestamp
    job.save()
  }

  let settlement = Settlement.load(id)
  if (!settlement) {
    settlement = new Settlement(id)
  }
  settlement.job = id
  settlement.employer = employer
  settlement.candidate = candidateId
  settlement.escrowAmount = event.params.escrowAmount
  settlement.settledAt = event.block.timestamp
  settlement.save()
}

export function handleJobCancelled(event: JobCancelledEvent): void {
  let employer = event.params.employer
  let jobId = event.params.jobId.toString()
  
  let id = employer.toHex() + "-" + jobId
  let job = Job.load(id)
  if (job) {
    job.status = "Cancelled"
    job.cancelledAt = event.block.timestamp
    job.save()
  }
}

export function handleMatchEvaluated(event: MatchEvaluatedEvent): void {
  let employer = event.params.employer
  let jobId = event.params.jobId.toString()
  let candidateId = event.params.candidate

  let id = employer.toHex() + "-" + jobId
  let job = Job.load(id)
  if (!job) return

  let matchId = id + "-" + candidateId.toHex()
  let match = MatchOutcome.load(matchId)
  if (!match) {
    match = new MatchOutcome(matchId)
  }
  match.job = job.id
  match.candidate = candidateId
  match.employer = employer
  match.evaluatedAt = event.block.timestamp
  match.save()
}

export function handleCandidateRated(event: CandidateRatedEvent): void {
  let employer = event.params.employer
  let candidateId = event.params.candidate
  let jobId = event.params.jobId

  let ratingId = employer.toHex() + "-" + candidateId.toHex() + "-" + jobId.toString()
  let rating = ReputationRating.load(ratingId)
  if (!rating) {
    rating = new ReputationRating(ratingId)
  }
  rating.employer = employer
  rating.candidate = candidateId
  rating.jobId = jobId
  rating.ratedAt = event.block.timestamp
  rating.save()
}

export function handleReferralRegistered(event: ReferralRegisteredEvent): void {
  let referee = event.params.referee
  let referrer = event.params.referrer
  
  let referral = new Referral(referee)
  referral.referrer = referrer
  referral.registeredAt = event.block.timestamp
  referral.save()
}

export function handleRewardClaimed(event: RewardClaimedEvent): void {
  let referrer = event.params.referrer
  let amount = event.params.amount
  let id = event.transaction.hash.toHex()
  
  let claim = new RewardClaim(id)
  claim.referrer = referrer
  claim.amount = amount
  claim.claimedAt = event.block.timestamp
  claim.save()
}
