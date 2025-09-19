// components/doctors/DoctorProfile.tsx
export default function DoctorProfile({ doctor }: { doctor: any }) {
  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">{doctor.user.name}</h2>
      <p>{doctor.specialization}</p>
      <p>{doctor.experience} years experience</p>
      <p>{doctor.qualification}</p>
      <p>{doctor.hospitalName}</p>
      <p>Fee: ₹{doctor.consultationFee}</p>
      <p>{doctor.bio}</p>
    </div>
  );
}
